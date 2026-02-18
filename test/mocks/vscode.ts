/**
 * Minimal vscode module mock for unit testing outside the extension host.
 */
export const workspace = {
  getConfiguration: () => ({
    get: (key: string, defaultValue: unknown) => defaultValue,
    update: async () => {},
  }),
  onDidChangeConfiguration: () => ({ dispose: () => {} }),
};

export const window = {
  showInformationMessage: async (..._args: unknown[]) => undefined,
  showWarningMessage: async (..._args: unknown[]) => undefined,
  showQuickPick: async (..._args: unknown[]) => undefined,
  createStatusBarItem: () => ({
    show: () => {},
    hide: () => {},
    dispose: () => {},
    text: "",
    tooltip: "",
    command: "",
    backgroundColor: undefined,
  }),
  createTreeView: () => ({ dispose: () => {} }),
};

export const env = {
  clipboard: {
    readText: async () => "",
    writeText: async () => {},
  },
  openExternal: async () => true,
};

export const commands = {
  registerCommand: (_cmd: string, _cb: Function) => ({ dispose: () => {} }),
  executeCommand: async () => {},
};

export const Uri = {
  parse: (s: string) => ({ toString: () => s }),
};

export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2,
}

export class TreeItem {
  label: string;
  description?: string;
  collapsibleState: TreeItemCollapsibleState;
  command?: unknown;
  contextValue?: string;
  id?: string;
  constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
    this.label = label;
    this.collapsibleState = collapsibleState ?? TreeItemCollapsibleState.None;
  }
}

export class ThemeColor {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class EventEmitter {
  private listeners: Function[] = [];
  event = (listener: Function) => {
    this.listeners.push(listener);
    return { dispose: () => {} };
  };
  fire(data?: unknown) {
    this.listeners.forEach((l) => l(data));
  }
  dispose() {
    this.listeners = [];
  }
}

export enum StatusBarAlignment {
  Left = 1,
  Right = 2,
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}

export class DocumentDropOrPasteEditKind {
  private parts: string[];
  constructor(...parts: string[]) {
    this.parts = parts;
  }
  static readonly Empty = new DocumentDropOrPasteEditKind();
  static readonly Text = new DocumentDropOrPasteEditKind("text");
  append(...parts: string[]): DocumentDropOrPasteEditKind {
    return new DocumentDropOrPasteEditKind(...this.parts, ...parts);
  }
}

export class DocumentPasteEdit {
  insertText: string;
  title: string;
  kind?: DocumentDropOrPasteEditKind;
  yieldTo?: readonly DocumentDropOrPasteEditKind[];
  constructor(
    insertText: string,
    title: string,
    kind?: DocumentDropOrPasteEditKind
  ) {
    this.insertText = insertText;
    this.title = title;
    this.kind = kind;
  }
}

export const languages = {
  registerDocumentPasteEditProvider: (
    _selector: unknown,
    _provider: unknown,
    _metadata: unknown
  ) => ({ dispose: () => {} }),
};
