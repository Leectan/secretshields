import * as vscode from "vscode";
import { ExposureStore } from "../rotation/exposureStore";

export interface StatusBarHandle extends vscode.Disposable {
  update(): void;
  pulseMasked(count: number): void;
}

export function createStatusBar(exposureStore: ExposureStore): StatusBarHandle {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  item.command = "secretshields.showExposureLog";

  const pulseItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    101
  );
  pulseItem.tooltip = "SecretShields: Clipboard masking signal";
  pulseItem.backgroundColor = new vscode.ThemeColor(
    "statusBarItem.prominentBackground"
  );

  let pulseTimer: ReturnType<typeof setTimeout> | undefined;

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

  function pulseMasked(count: number): void {
    if (pulseTimer) {
      clearTimeout(pulseTimer);
      pulseTimer = undefined;
    }

    pulseItem.text = `$(shield) Masked ${count}`;
    pulseItem.tooltip = `SecretShields: Masked ${count} secret(s) in clipboard.`;
    pulseItem.show();

    pulseTimer = setTimeout(() => {
      pulseItem.hide();
      pulseTimer = undefined;
    }, 5000);
  }

  update();

  return {
    update,
    pulseMasked,
    dispose: () => {
      if (pulseTimer) {
        clearTimeout(pulseTimer);
        pulseTimer = undefined;
      }
      pulseItem.dispose();
      item.dispose();
    },
  };
}
