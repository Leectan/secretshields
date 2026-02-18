import * as vscode from "vscode";
import { ExposureStore } from "../rotation/exposureStore";

export interface StatusBarHandle extends vscode.Disposable {
  update(): void;
}

export function createStatusBar(exposureStore: ExposureStore): StatusBarHandle {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  item.command = "redakt.showExposureLog";

  function update(): void {
    const exposed = exposureStore.getExposed();
    if (exposed.length === 0) {
      item.text = "$(shield) Redakt";
      item.tooltip = "Redakt: Clipboard protection active. No exposed secrets.";
      item.backgroundColor = undefined;
    } else {
      item.text = `$(shield) Redakt: ${exposed.length} exposed`;
      item.tooltip = `Redakt: ${exposed.length} secret(s) exposed — click to view.`;
      item.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground"
      );
    }
    item.show();
  }

  update();

  return {
    update,
    dispose: () => item.dispose(),
  };
}
