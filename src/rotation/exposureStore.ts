import * as vscode from "vscode";

export type ExposureStatus = "exposed" | "rotated" | "dismissed";

export interface ExposureEvent {
  id: string;
  provider: string;
  secretType: string;
  severity: string;
  maskedPreview: string;
  timestamp: number;
  rotationUrl: string | null;
  countdownMinutes: number;
  status: ExposureStatus;
}

/**
 * Persists exposure metadata (never raw secrets) in globalState.
 */
export class ExposureStore {
  private static readonly STORAGE_KEY = "redakt.exposureLog";
  private events: ExposureEvent[] = [];
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.events =
      context.globalState.get<ExposureEvent[]>(ExposureStore.STORAGE_KEY) ?? [];
  }

  addExposure(params: {
    provider: string;
    secretType: string;
    severity: string;
    maskedPreview: string;
    rotationUrl: string | null;
    countdownMinutes: number;
  }): ExposureEvent {
    const event: ExposureEvent = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...params,
      timestamp: Date.now(),
      status: "exposed",
    };

    this.events.unshift(event);
    this.persist();
    this._onDidChange.fire();
    return event;
  }

  markRotated(id: string): void {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.status = "rotated";
      this.persist();
      this._onDidChange.fire();
    }
  }

  dismiss(id: string): void {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.status = "dismissed";
      this.persist();
      this._onDidChange.fire();
    }
  }

  getAll(): ExposureEvent[] {
    return [...this.events];
  }

  getExposed(): ExposureEvent[] {
    return this.events.filter((e) => e.status === "exposed");
  }

  clearAll(): void {
    this.events = [];
    this.persist();
    this._onDidChange.fire();
  }

  private persist(): void {
    this.context.globalState.update(ExposureStore.STORAGE_KEY, this.events);
  }

  dispose(): void {
    this._onDidChange.dispose();
  }
}
