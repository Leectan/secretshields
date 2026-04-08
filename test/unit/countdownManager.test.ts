import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { CountdownManager } from "../../src/rotation/countdownManager";

describe("CountdownManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T12:00:00.000Z"));
    (vscode.window as any).showWarningMessage = vi
      .fn()
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rehydrates a pending countdown from persisted exposure metadata", async () => {
    const store = {
      getExposed: () => [
        {
          id: "exp_pending",
          provider: "AWS",
          rotationUrl: "https://example.com/rotate",
          countdownMinutes: 1,
          timestamp: Date.now() - 30_000,
        },
      ],
      markRotated: vi.fn(),
      dismiss: vi.fn(),
    } as any;

    const manager = new CountdownManager(store);
    manager.resumePendingCountdowns();

    expect(manager.getActiveCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(30_000);

    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
      expect.stringContaining("Rotation reminder: AWS secret was exposed."),
      "Open Rotation Page",
      "Mark Rotated",
      "Dismiss"
    );
    expect(manager.getActiveCount()).toBe(0);
  });

  it("prompts immediately on startup for already-expired unresolved exposures", async () => {
    const store = {
      getExposed: () => [
        {
          id: "exp_expired",
          provider: "GitHub",
          rotationUrl: "https://github.com/settings/tokens",
          countdownMinutes: 1,
          timestamp: Date.now() - 120_000,
        },
      ],
      markRotated: vi.fn(),
      dismiss: vi.fn(),
    } as any;

    const manager = new CountdownManager(store);
    manager.resumePendingCountdowns();

    await vi.advanceTimersByTimeAsync(0);

    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
      expect.stringContaining("Rotation reminder: GitHub secret was exposed."),
      "Open Rotation Page",
      "Mark Rotated",
      "Dismiss"
    );
  });

  it("can cancel all countdowns without leaving stale reminders behind", async () => {
    const store = {
      getExposed: () => [],
      markRotated: vi.fn(),
      dismiss: vi.fn(),
    } as any;

    const manager = new CountdownManager(store);
    manager.startCountdown(
      "exp_clear",
      1,
      "AWS",
      "https://example.com/rotate"
    );

    expect(manager.getActiveCount()).toBe(1);

    manager.cancelAllCountdowns();
    expect(manager.getActiveCount()).toBe(0);

    await vi.advanceTimersByTimeAsync(60_000);

    expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
  });
});
