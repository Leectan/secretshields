import * as vscode from "vscode";
import { ExposureStore } from "./exposureStore";
import { getRotationGuidance } from "./rotationLinks";

interface ActiveCountdown {
  exposureId: string;
  timer: ReturnType<typeof setTimeout>;
  expiresAt: number;
}

/**
 * Manages rotation countdown timers for exposed secrets.
 * When a countdown expires, shows a notification prompting rotation.
 */
export class CountdownManager implements vscode.Disposable {
  private countdowns = new Map<string, ActiveCountdown>();

  constructor(private readonly exposureStore: ExposureStore) {}

  startCountdown(exposureId: string, minutes: number, provider: string, rotationUrl: string | null): void {
    const ms = minutes * 60 * 1000;
    this.scheduleCountdown(exposureId, ms, Date.now() + ms, provider, rotationUrl);
  }

  /**
   * Rehydrate unresolved exposures after reload/restart so reminders still fire.
   */
  resumePendingCountdowns(): void {
    for (const exposure of this.exposureStore.getExposed()) {
      const expiresAt =
        exposure.timestamp + exposure.countdownMinutes * 60 * 1000;
      this.scheduleCountdown(
        exposure.id,
        expiresAt - Date.now(),
        expiresAt,
        exposure.provider,
        exposure.rotationUrl
      );
    }
  }

  cancelAllCountdowns(): void {
    for (const countdown of this.countdowns.values()) {
      clearTimeout(countdown.timer);
    }
    this.countdowns.clear();
  }

  cancelCountdown(exposureId: string): void {
    const countdown = this.countdowns.get(exposureId);
    if (countdown) {
      clearTimeout(countdown.timer);
      this.countdowns.delete(exposureId);
    }
  }

  getActiveCount(): number {
    return this.countdowns.size;
  }

  private scheduleCountdown(
    exposureId: string,
    delayMs: number,
    expiresAt: number,
    provider: string,
    rotationUrl: string | null
  ): void {
    this.cancelCountdown(exposureId);

    const timer = setTimeout(() => {
      void this.onCountdownExpired(exposureId, provider, rotationUrl);
    }, Math.max(0, delayMs));

    this.countdowns.set(exposureId, { exposureId, timer, expiresAt });
  }

  private async onCountdownExpired(
    exposureId: string,
    provider: string,
    rotationUrl: string | null
  ): Promise<void> {
    this.countdowns.delete(exposureId);

    const guidance = getRotationGuidance(provider);
    const actions: string[] = ["Mark Rotated", "Dismiss"];
    if (rotationUrl) {
      actions.unshift("Open Rotation Page");
    }

    const choice = await vscode.window.showWarningMessage(
      `Rotation reminder: ${provider} secret was exposed. ${guidance}`,
      ...actions
    );

    if (choice === "Open Rotation Page" && rotationUrl) {
      vscode.env.openExternal(vscode.Uri.parse(rotationUrl));
    } else if (choice === "Mark Rotated") {
      this.exposureStore.markRotated(exposureId);
    } else if (choice === "Dismiss") {
      this.exposureStore.dismiss(exposureId);
    }
  }

  dispose(): void {
    this.cancelAllCountdowns();
  }
}
