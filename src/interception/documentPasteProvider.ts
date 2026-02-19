import * as vscode from "vscode";
import { maskAllSecrets } from "../detection/engine";

const SECRETSHIELDS_PASTE_KIND = vscode.DocumentDropOrPasteEditKind.Text.append(
  "secretshields",
  "mask"
);

/**
 * Compute which detector patterns are enabled from `secretshields.detectors.*`
 * settings. Returns `undefined` when all detectors are on (no filter needed).
 */
export function getEnabledPatterns(): Set<string> | undefined {
  const config = vscode.workspace.getConfiguration("secretshields");
  const keys = [
    "secretshields.detectors.awsKeys",
    "secretshields.detectors.githubTokens",
    "secretshields.detectors.stripeKeys",
    "secretshields.detectors.openaiKeys",
    "secretshields.detectors.anthropicKeys",
    "secretshields.detectors.googleApiKeys",
    "secretshields.detectors.databaseUrls",
    "secretshields.detectors.sshPrivateKeys",
    "secretshields.detectors.jwts",
  ];

  const enabled = new Set<string>();
  let allEnabled = true;
  for (const key of keys) {
    const shortKey = key.replace("secretshields.", "");
    if (config.get<boolean>(shortKey, true)) {
      enabled.add(key);
    } else {
      allEnabled = false;
    }
  }

  return allEnabled ? undefined : enabled;
}

/**
 * Pure logic for paste masking — extracted for testability.
 * Returns the masked text and detection count, or null if no secrets found.
 */
export function processPasteText(
  text: string,
  enabledPatterns?: Set<string>
): { maskedText: string; detectionCount: number } | null {
  const { masked, detections } = maskAllSecrets(text, enabledPatterns);
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
class SecretShieldsPasteProvider
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

    const result = processPasteText(text, getEnabledPatterns());
    if (!result) {
      return undefined;
    }

    const edit = new vscode.DocumentPasteEdit(
      result.maskedText,
      `Paste with SecretShields masking (${result.detectionCount} secret${result.detectionCount > 1 ? "s" : ""} masked)`,
      SECRETSHIELDS_PASTE_KIND
    );

    // In "offer" mode: yield to default text paste so SecretShields appears as secondary option
    const config = vscode.workspace.getConfiguration("secretshields");
    const mode = config.get<string>("editorPasteMasking.mode", "offer");
    if (mode === "offer") {
      edit.yieldTo = [vscode.DocumentDropOrPasteEditKind.Text];
    }
    // In "auto" mode: no yieldTo, so SecretShields tries to be first (best-effort ordering)

    return [edit];
  }
}

const METADATA: vscode.DocumentPasteProviderMetadata = {
  pasteMimeTypes: ["text/plain"],
  providedPasteEditKinds: [SECRETSHIELDS_PASTE_KIND],
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
    new SecretShieldsPasteProvider(),
    METADATA
  );
}
