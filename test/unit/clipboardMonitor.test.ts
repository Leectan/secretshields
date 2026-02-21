import { describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { ClipboardMonitor } from "../../src/interception/clipboardMonitor";

describe("ClipboardMonitor", () => {
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

    (vscode.workspace as any).getConfiguration = () => ({
      get: (_key: string, defaultValue: unknown) => defaultValue,
      update: async () => {},
    });

    (vscode.window as any).showWarningMessage = vi.fn().mockResolvedValue(undefined);

    const monitor = new ClipboardMonitor({} as any, {} as any);

    await (monitor as any).poll();
    expect((monitor as any).isMasking).toBe(false);

    await (monitor as any).poll();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect((monitor as any).isMasking).toBe(false);
  });
});

