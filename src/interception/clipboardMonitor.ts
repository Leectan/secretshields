import * as vscode from "vscode";
import { maskAllSecrets } from "../detection/engine";
import type { DetectionResult } from "../detection/engine";
import { ExposureStore } from "../rotation/exposureStore";
import { CountdownManager } from "../rotation/countdownManager";

interface CachedSecret {
  original: string;
  detections: DetectionResult[];
  expiresAt: number;
}

/**
 * Monitors the clipboard for secrets and masks them automatically.
 * Keeps the original in-memory only (never disk) for short TTL restore.
 */
export class ClipboardMonitor {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  private lastClipboard = "";
  private cachedSecret: CachedSecret | undefined;
  private isMasking = false; // prevents re-detection of our own masked writes

  constructor(
    private readonly exposureStore: ExposureStore,
    private readonly countdownManager: CountdownManager
  ) {}

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private scheduleNext(): void {
    if (!this.running) {
      return;
    }
    const config = vscode.workspace.getConfiguration("secretshields");
    const interval = config.get<number>("pollIntervalMs", 1000);
    this.timer = setTimeout(async () => {
      await this.poll();
      this.scheduleNext();
    }, interval);
  }

  async maskClipboardNow(): Promise<void> {
    const text = await vscode.env.clipboard.readText();
    if (!text) {
      vscode.window.showInformationMessage("Clipboard is empty.");
      return;
    }

    const { masked, detections } = maskAllSecrets(text, this.getEnabledPatterns());
    if (detections.length === 0) {
      vscode.window.showInformationMessage("No secrets detected in clipboard.");
      return;
    }

    this.cacheOriginal(text, detections);
    this.isMasking = true;
    await vscode.env.clipboard.writeText(masked);
    this.lastClipboard = masked;
    this.isMasking = false;

    vscode.window.showInformationMessage(
      `SecretShields: Masked ${detections.length} secret(s) in clipboard.`
    );
  }

  async restoreLastSecret(): Promise<void> {
    if (!this.cachedSecret) {
      vscode.window.showWarningMessage("No masked secret available to restore.");
      return;
    }

    if (Date.now() > this.cachedSecret.expiresAt) {
      this.cachedSecret = undefined;
      vscode.window.showWarningMessage(
        "Restore window expired. The original secret has been discarded."
      );
      return;
    }

    // Restore original to clipboard
    this.isMasking = true;
    await vscode.env.clipboard.writeText(this.cachedSecret.original);
    this.lastClipboard = this.cachedSecret.original;
    this.isMasking = false;

    // Create exposure events for each detected secret
    const config = vscode.workspace.getConfiguration("secretshields");
    for (const d of this.cachedSecret.detections) {
      const countdownMinutes = config.get<number>(
        `countdownMinutes.${d.severity}`,
        d.severity === "critical" ? 15 : d.severity === "high" ? 60 : 240
      );

      const event = this.exposureStore.addExposure({
        provider: d.provider,
        secretType: d.name,
        severity: d.severity,
        maskedPreview: d.masked,
        rotationUrl: d.rotationUrl,
        countdownMinutes,
      });

      // Start rotation countdown
      this.countdownManager.startCountdown(
        event.id,
        countdownMinutes,
        d.provider,
        d.rotationUrl
      );
    }

    this.cachedSecret = undefined;

    vscode.window.showWarningMessage(
      `SecretShields: Secret restored to clipboard. Rotation reminder started. ` +
      `Re-copy something else or the secret will remain in clipboard.`
    );
  }

  private async poll(): Promise<void> {
    if (this.isMasking) {
      return;
    }

    try {
      const text = await vscode.env.clipboard.readText();

      // Skip if clipboard hasn't changed
      if (text === this.lastClipboard || !text) {
        return;
      }

      this.lastClipboard = text;

      const config = vscode.workspace.getConfiguration("secretshields");
      if (!config.get<boolean>("enabled", true)) {
        return;
      }

      const { masked, detections } = maskAllSecrets(text, this.getEnabledPatterns());
      if (detections.length === 0) {
        return;
      }

      const autoMask = config.get<boolean>("autoMask", true);

      if (autoMask) {
        this.cacheOriginal(text, detections);
        this.isMasking = true;
        await vscode.env.clipboard.writeText(masked);
        this.lastClipboard = masked;
        this.isMasking = false;

        const ttl = config.get<number>("restoreTTLSeconds", 60);
        const choice = await vscode.window.showWarningMessage(
          `SecretShields: Masked ${detections.length} secret(s) in clipboard.`,
          "Keep Masked (Safe)",
          `Restore for ${ttl}s (Exposes)`,
          "Disable SecretShields"
        );

        if (choice === `Restore for ${ttl}s (Exposes)`) {
          await this.restoreLastSecret();
        } else if (choice === "Disable SecretShields") {
          await config.update("enabled", false, vscode.ConfigurationTarget.Global);
          this.stop();
          vscode.window.showInformationMessage("SecretShields disabled. Re-enable in settings.");
        }
      } else {
        // Non-auto mode: just warn
        const choice = await vscode.window.showWarningMessage(
          `SecretShields: Detected ${detections.length} secret(s) in clipboard.`,
          "Mask Clipboard",
          "Ignore"
        );

        if (choice === "Mask Clipboard") {
          await this.maskClipboardNow();
        }
      }
    } catch {
      // Clipboard read can fail if permission denied; silently skip
    }
  }

  private cacheOriginal(original: string, detections: DetectionResult[]): void {
    const config = vscode.workspace.getConfiguration("secretshields");
    const ttlSeconds = config.get<number>("restoreTTLSeconds", 60);
    this.cachedSecret = {
      original,
      detections,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };

    // Auto-expire the cache
    setTimeout(() => {
      if (this.cachedSecret?.expiresAt && Date.now() >= this.cachedSecret.expiresAt) {
        this.cachedSecret = undefined;
      }
    }, ttlSeconds * 1000 + 100);
  }

  private getEnabledPatterns(): Set<string> | undefined {
    const config = vscode.workspace.getConfiguration("secretshields");
    const keys = [
      "secretshields.detectors.awsKeys",
      "secretshields.detectors.githubTokens",
      "secretshields.detectors.stripeKeys",
      "secretshields.detectors.openaiKeys",
      "secretshields.detectors.anthropicKeys",
      "secretshields.detectors.googleApiKeys",
      "secretshields.detectors.databaseUrls",
      "secretshields.detectors.sshPrivateKeys",
      "secretshields.detectors.jwts",
    ];

    const enabled = new Set<string>();
    let allEnabled = true;
    for (const key of keys) {
      const shortKey = key.replace("secretshields.", "");
      if (config.get<boolean>(shortKey, true)) {
        enabled.add(key);
      } else {
        allEnabled = false;
      }
    }

    // If all enabled, return undefined (no filter = faster)
    return allEnabled ? undefined : enabled;
  }
}
