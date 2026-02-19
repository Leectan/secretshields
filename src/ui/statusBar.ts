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

  item.command = "secretshields.showExposureLog";

  function update(): void {
    const exposed = exposureStore.getExposed();
    if (exposed.length === 0) {
      item.text = "$(shield) SecretShields";
      item.tooltip = "SecretShields: Clipboard protection active. No exposed secrets.";
      item.backgroundColor = undefined;
    } else {
      item.text = `$(shield) SecretShields: ${exposed.length} exposed`;
      item.tooltip = `SecretShields: ${exposed.length} secret(s) exposed — click to view.`;
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
