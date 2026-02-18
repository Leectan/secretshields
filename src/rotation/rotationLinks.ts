/**
 * Central mapping of provider -> rotation URL.
 */
const ROTATION_URLS: Record<string, string> = {
  AWS: "https://console.aws.amazon.com/iam/home#/security_credentials",
  GitHub: "https://github.com/settings/tokens",
  Stripe: "https://dashboard.stripe.com/apikeys",
  OpenAI: "https://platform.openai.com/api-keys",
  Anthropic: "https://console.anthropic.com/settings/keys",
  Google: "https://console.cloud.google.com/apis/credentials",
};

const GENERIC_GUIDANCE =
  "Rotate this credential using your provider's dashboard or CLI. " +
  "Generate a new credential, update all services using it, then revoke the old one.";

export function getRotationUrl(provider: string): string | null {
  return ROTATION_URLS[provider] ?? null;
}

export function getRotationGuidance(provider: string): string {
  const url = ROTATION_URLS[provider];
  if (url) {
    return `Rotate at: ${url}`;
  }
  return GENERIC_GUIDANCE;
}
