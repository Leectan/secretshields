import * as vscode from "vscode";
import { ClipboardMonitor } from "./interception/clipboardMonitor";
import {
  isEditorPasteMaskingEnabled,
  registerPasteProvider,
} from "./interception/documentPasteProvider";
import type { DetectionResult } from "./detection/engine";
import { ExposureStore } from "./rotation/exposureStore";
import { CountdownManager } from "./rotation/countdownManager";
import { createStatusBar } from "./ui/statusBar";
import { ExposureTreeProvider } from "./ui/exposureTreeView";

let clipboardMonitor: ClipboardMonitor | undefined;
let pasteProviderDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const exposureStore = new ExposureStore(context);
  const countdownManager = new CountdownManager(exposureStore);
  const treeProvider = new ExposureTreeProvider(exposureStore);
  const statusBar = createStatusBar(exposureStore);
  const output = vscode.window.createOutputChannel("SecretShields");

  context.subscriptions.push(output);

  const signalMaskEvent = (detections: DetectionResult[]): void => {
    const config = vscode.workspace.getConfiguration("secretshields");
    const mode = config.get<string>("maskingSignal.mode", "statusBar");
    if (mode === "off") {
      return;
    }

    const count = detections.length;

    if (mode === "statusBar" || mode === "both") {
      statusBar.pulseMasked(count);
    }

    if (mode === "output" || mode === "both") {
      const providers = Array.from(new Set(detections.map((d) => d.provider)))
        .sort()
        .join(", ");
      const timestamp = new Date().toISOString();
      output.appendLine(
        `[${timestamp}] Masked ${count} secret(s) in clipboard${providers ? ` (${providers})` : ""}.`
      );
    }
  };

  clipboardMonitor = new ClipboardMonitor(
    exposureStore,
    countdownManager,
    signalMaskEvent
  );
  countdownManager.resumePendingCountdowns();

  const tree = vscode.window.createTreeView("secretshields.exposureLog", {
    treeDataProvider: treeProvider,
  });

  const syncProtectionState = (): void => {
    const config = vscode.workspace.getConfiguration("secretshields");
    const enabled = config.get<boolean>("enabled", true);

    if (enabled) {
      clipboardMonitor?.start();
    } else {
      clipboardMonitor?.stop();
    }

    if (isEditorPasteMaskingEnabled()) {
      if (!pasteProviderDisposable) {
        pasteProviderDisposable = registerPasteProvider();
        context.subscriptions.push(pasteProviderDisposable);
      }
      return;
    }

    if (pasteProviderDisposable) {
      pasteProviderDisposable.dispose();
      pasteProviderDisposable = undefined;
    }
  };

  context.subscriptions.push(
    tree,
    statusBar,
    countdownManager,

    vscode.commands.registerCommand("secretshields.maskClipboard", async () => {
      await clipboardMonitor?.maskClipboardNow();
    }),

    vscode.commands.registerCommand("secretshields.restoreLastSecret", async () => {
      await clipboardMonitor?.restoreLastSecret();
    }),

    vscode.commands.registerCommand("secretshields.showExposureLog", () => {
      vscode.commands.executeCommand("secretshields.exposureLog.focus");
    }),

    vscode.commands.registerCommand("secretshields.clearExposureLog", async () => {
      const confirm = await vscode.window.showWarningMessage(
        "Clear all exposure history?",
        { modal: true },
        "Clear"
      );
      if (confirm === "Clear") {
        countdownManager.cancelAllCountdowns();
        exposureStore.clearAll();
        treeProvider.refresh();
        vscode.window.showInformationMessage("Exposure log cleared.");
      }
    }),

    vscode.commands.registerCommand("secretshields.markRotated", async () => {
      const events = exposureStore
        .getAll()
        .filter((e) => e.status === "exposed");
      if (events.length === 0) {
        vscode.window.showInformationMessage("No exposed secrets to mark.");
        return;
      }
      const picked = await vscode.window.showQuickPick(
        events.map((e) => ({
          label: `${e.provider} — ${e.maskedPreview}`,
          description: e.severity,
          id: e.id,
        })),
        { placeHolder: "Select a secret to mark as rotated" }
      );
      if (picked) {
        exposureStore.markRotated(picked.id);
        treeProvider.refresh();
        countdownManager.cancelCountdown(picked.id);
        vscode.window.showInformationMessage(
          `Marked ${picked.label} as rotated.`
        );
      }
    })
  );

  syncProtectionState();

  // Listen for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration("secretshields.enabled") ||
        e.affectsConfiguration("secretshields.editorPasteMasking.mode")
      ) {
        syncProtectionState();
      }
    })
  );

  // Defensive: if the extension is uninstalled/disabled while the host is still
  // running, stop all in-flight work immediately.  Best-effort — onDidChange
  // may not fire in every VS Code fork, but it's free to try.
  const selfId = context.extension.id;
  context.subscriptions.push(
    vscode.extensions.onDidChange(() => {
      try {
        if (!vscode.extensions.getExtension(selfId)) {
          clipboardMonitor?.stop();
          if (pasteProviderDisposable) {
            pasteProviderDisposable.dispose();
            pasteProviderDisposable = undefined;
          }
        }
      } catch {
        // Never crash the extension host.
      }
    })
  );

  // Wire up exposure store changes to refresh UI
  context.subscriptions.push(
    exposureStore.onDidChange(() => {
      treeProvider.refresh();
      statusBar.update();
    })
  );
}

export function deactivate(): void {
  clipboardMonitor?.stop();
}
