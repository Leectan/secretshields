import * as vscode from "vscode";
import { ClipboardMonitor } from "./interception/clipboardMonitor";
import { registerPasteProvider } from "./interception/documentPasteProvider";
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

  clipboardMonitor = new ClipboardMonitor(exposureStore, countdownManager);

  const tree = vscode.window.createTreeView("redakt.exposureLog", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(
    tree,
    statusBar,
    countdownManager,

    vscode.commands.registerCommand("redakt.maskClipboard", () => {
      clipboardMonitor?.maskClipboardNow();
    }),

    vscode.commands.registerCommand("redakt.restoreLastSecret", () => {
      clipboardMonitor?.restoreLastSecret();
    }),

    vscode.commands.registerCommand("redakt.showExposureLog", () => {
      vscode.commands.executeCommand("redakt.exposureLog.focus");
    }),

    vscode.commands.registerCommand("redakt.clearExposureLog", async () => {
      const confirm = await vscode.window.showWarningMessage(
        "Clear all exposure history?",
        { modal: true },
        "Clear"
      );
      if (confirm === "Clear") {
        exposureStore.clearAll();
        treeProvider.refresh();
        vscode.window.showInformationMessage("Exposure log cleared.");
      }
    }),

    vscode.commands.registerCommand("redakt.markRotated", async () => {
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

  // Start clipboard monitoring if enabled
  const config = vscode.workspace.getConfiguration("redakt");
  if (config.get<boolean>("enabled", true)) {
    clipboardMonitor.start();
  }

  // Register editor paste provider if mode is not "off"
  const pasteMode = config.get<string>("editorPasteMasking.mode", "offer");
  if (pasteMode !== "off") {
    pasteProviderDisposable = registerPasteProvider();
    context.subscriptions.push(pasteProviderDisposable);
  }

  // Listen for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("redakt.enabled")) {
        const enabled = vscode.workspace
          .getConfiguration("redakt")
          .get<boolean>("enabled", true);
        if (enabled) {
          clipboardMonitor?.start();
        } else {
          clipboardMonitor?.stop();
        }
      }

      if (e.affectsConfiguration("redakt.editorPasteMasking.mode")) {
        const mode = vscode.workspace
          .getConfiguration("redakt")
          .get<string>("editorPasteMasking.mode", "offer");

        // Dispose existing provider
        if (pasteProviderDisposable) {
          pasteProviderDisposable.dispose();
          pasteProviderDisposable = undefined;
        }

        // Re-register if not "off"
        if (mode !== "off") {
          pasteProviderDisposable = registerPasteProvider();
          context.subscriptions.push(pasteProviderDisposable);
        }
      }
    })
  );

  // Wire up exposure store changes to refresh UI
  exposureStore.onDidChange(() => {
    treeProvider.refresh();
    statusBar.update();
  });
}

export function deactivate(): void {
  clipboardMonitor?.stop();
}
