import * as vscode from "vscode";
import { ExposureStore, type ExposureEvent } from "../rotation/exposureStore";

export class ExposureTreeProvider
  implements vscode.TreeDataProvider<ExposureTreeItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    ExposureTreeItem | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly store: ExposureStore) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ExposureTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ExposureTreeItem[] {
    const events = this.store.getAll();
    if (events.length === 0) {
      return [
        new ExposureTreeItem(
          "No exposure events",
          "",
          vscode.TreeItemCollapsibleState.None,
          undefined
        ),
      ];
    }

    return events.map((event) => {
      const age = formatAge(event.timestamp);
      const icon = statusIcon(event.status);
      const label = `${icon} ${event.provider}: ${event.maskedPreview}`;
      const description = `${event.severity} — ${event.status} — ${age}`;

      const item = new ExposureTreeItem(
        label,
        description,
        vscode.TreeItemCollapsibleState.None,
        event
      );

      if (event.status === "exposed" && event.rotationUrl) {
        item.command = {
          title: "Open Rotation Page",
          command: "vscode.open",
          arguments: [vscode.Uri.parse(event.rotationUrl)],
        };
      }

      item.contextValue = event.status;

      return item;
    });
  }
}

class ExposureTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly event: ExposureEvent | undefined
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.id = event?.id;
  }
}

function statusIcon(status: string): string {
  switch (status) {
    case "exposed":
      return "\u26a0\ufe0f"; // warning sign
    case "rotated":
      return "\u2705"; // check mark
    case "dismissed":
      return "\u2796"; // minus
    default:
      return "\u2753"; // question mark
  }
}

function formatAge(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) {
    return "just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
