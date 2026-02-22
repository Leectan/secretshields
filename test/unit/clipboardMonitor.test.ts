import { describe, expect, it, vi, beforeEach } from "vitest";
import * as vscode from "vscode";
import { ClipboardMonitor } from "../../src/interception/clipboardMonitor";

/** Create a deferred promise: { promise, resolve, reject } */
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("ClipboardMonitor", () => {
  beforeEach(() => {
    // Reset mocks to defaults before each test
    (vscode.env.clipboard as any).readText = vi.fn().mockResolvedValue("");
    (vscode.env.clipboard as any).writeText = vi.fn().mockResolvedValue(undefined);
    (vscode.window as any).showWarningMessage = vi.fn().mockResolvedValue(undefined);
    (vscode.window as any).showInformationMessage = vi.fn().mockResolvedValue(undefined);
    (vscode.workspace as any).getConfiguration = () => ({
      get: (_key: string, defaultValue: unknown) => defaultValue,
      update: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("does not get stuck in isMasking=true if clipboard write fails", async () => {
    const readText = vi
      .fn()
      .mockResolvedValueOnce(
        "AKIAIOSFODNN7TSTKEY1\nghp_0123456789abcdefghijklmnopqrstuvwxyz"
      )
      .mockResolvedValueOnce("AKIAIOSFODNN7TSTKEY1");

    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error("clipboard write failed"))
      .mockResolvedValueOnce(undefined);

    (vscode.env.clipboard as any).readText = readText;
    (vscode.env.clipboard as any).writeText = writeText;

    (vscode.window as any).showWarningMessage = vi.fn().mockResolvedValue(undefined);

    const monitor = new ClipboardMonitor({} as any, {} as any);
    (monitor as any).running = true;

    await (monitor as any).poll();
    expect((monitor as any).isMasking).toBe(false);

    await (monitor as any).poll();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect((monitor as any).isMasking).toBe(false);
  });

  it("stop() while poll() is awaiting readText prevents any writeText call", async () => {
    const readDeferred = deferred<string>();
    const writeText = vi.fn().mockResolvedValue(undefined);

    (vscode.env.clipboard as any).readText = vi.fn().mockReturnValue(readDeferred.promise);
    (vscode.env.clipboard as any).writeText = writeText;

    const monitor = new ClipboardMonitor({} as any, {} as any);
    (monitor as any).running = true;

    // Start poll — it will block on readText
    const pollPromise = (monitor as any).poll();

    // Stop while poll is awaiting readText
    monitor.stop();

    // Now resolve readText with a secret
    readDeferred.resolve("AKIAIOSFODNN7TSTKEY1");
    await pollPromise;

    // writeText should never have been called — poll bailed after generation check
    expect(writeText).not.toHaveBeenCalled();
  });

  it("stop() while poll() is awaiting showWarningMessage ignores the eventual choice", async () => {
    const toastDeferred = deferred<string | undefined>();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const configUpdate = vi.fn().mockResolvedValue(undefined);

    (vscode.env.clipboard as any).readText = vi
      .fn()
      .mockResolvedValue("AKIAIOSFODNN7TSTKEY1");
    (vscode.env.clipboard as any).writeText = writeText;

    (vscode.workspace as any).getConfiguration = () => ({
      get: (key: string, defaultValue: unknown) => {
        if (key === "restoreTTLSeconds") return 60;
        return defaultValue;
      },
      update: configUpdate,
    });

    // showWarningMessage will block on our deferred
    (vscode.window as any).showWarningMessage = vi.fn().mockReturnValue(toastDeferred.promise);

    const monitor = new ClipboardMonitor({} as any, {} as any);
    (monitor as any).running = true;

    // Start poll — it will detect the secret, write masked text, then block on toast
    const pollPromise = (monitor as any).poll();

    // Wait a tick so poll reaches the toast await
    await new Promise((r) => setTimeout(r, 0));

    // writeText should have been called once for the masking write
    expect(writeText).toHaveBeenCalledTimes(1);

    // Now stop the monitor while the toast is pending
    monitor.stop();

    // Resolve the toast with "Disable SecretShields"
    toastDeferred.resolve("Disable SecretShields");
    await pollPromise;

    // Despite the user choosing "Disable SecretShields", config.update should NOT
    // have been called because the generation check after the toast bailed.
    expect(configUpdate).not.toHaveBeenCalled();
  });

  it("stop() clears cachedSecret and resets isMasking", () => {
    const monitor = new ClipboardMonitor({} as any, {} as any);
    (monitor as any).running = true;
    (monitor as any).isMasking = true;
    (monitor as any).cachedSecret = { original: "secret", detections: [], expiresAt: 0 };

    monitor.stop();

    expect((monitor as any).running).toBe(false);
    expect((monitor as any).isMasking).toBe(false);
    expect((monitor as any).cachedSecret).toBeUndefined();
  });
});
