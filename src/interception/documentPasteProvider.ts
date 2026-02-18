import * as vscode from "vscode";
import { maskAllSecrets } from "../detection/engine";

const REDAKT_PASTE_KIND = vscode.DocumentDropOrPasteEditKind.Text.append(
  "redakt",
  "mask"
);

/**
 * Pure logic for paste masking — extracted for testability.
 * Returns the masked text and detection count, or null if no secrets found.
 */
export function processPasteText(
  text: string
): { maskedText: string; detectionCount: number } | null {
  const { masked, detections } = maskAllSecrets(text);
  if (detections.length === 0) {
    return null;
  }
  return { maskedText: masked, detectionCount: detections.length };
}

/**
 * DocumentPasteEditProvider that offers masked paste when secrets are detected.
 * Scoped to editor documents only (not terminal/chat/webviews).
 * Never persists raw paste text anywhere.
 */
class RedaktPasteProvider
  implements vscode.DocumentPasteEditProvider<vscode.DocumentPasteEdit>
{
  async provideDocumentPasteEdits(
    _document: vscode.TextDocument,
    _ranges: readonly vscode.Range[],
    dataTransfer: vscode.DataTransfer,
    _context: vscode.DocumentPasteEditContext,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentPasteEdit[] | undefined> {
    const item = dataTransfer.get("text/plain");
    if (!item) {
      return undefined;
    }

    const text = await item.asString();
    if (token.isCancellationRequested) {
      return undefined;
    }

    const result = processPasteText(text);
    if (!result) {
      return undefined;
    }

    const edit = new vscode.DocumentPasteEdit(
      result.maskedText,
      `Paste with Redakt masking (${result.detectionCount} secret${result.detectionCount > 1 ? "s" : ""} masked)`,
      REDAKT_PASTE_KIND
    );

    // In "offer" mode: yield to default text paste so Redakt appears as secondary option
    const config = vscode.workspace.getConfiguration("redakt");
    const mode = config.get<string>("editorPasteMasking.mode", "offer");
    if (mode === "offer") {
      edit.yieldTo = [vscode.DocumentDropOrPasteEditKind.Text];
    }
    // In "auto" mode: no yieldTo, so Redakt tries to be first (best-effort ordering)

    return [edit];
  }
}

const METADATA: vscode.DocumentPasteProviderMetadata = {
  pasteMimeTypes: ["text/plain"],
  providedPasteEditKinds: [REDAKT_PASTE_KIND],
};

const FILE_SELECTOR: vscode.DocumentSelector = [
  { scheme: "file" },
  { scheme: "untitled" },
];

/**
 * Register the paste provider. Returns a Disposable.
 */
export function registerPasteProvider(): vscode.Disposable {
  return vscode.languages.registerDocumentPasteEditProvider(
    FILE_SELECTOR,
    new RedaktPasteProvider(),
    METADATA
  );
}
