/**
 * Synthetic test secrets — NONE of these are real credentials.
 * They match the expected format patterns but are fabricated.
 */

export const TRUE_POSITIVES = {
  // ── AWS ──
  awsAccessKeyId: "AKIA" + "IOSFODNN7EXAMPLA",
  awsSecretAccessKey:
    'aws_secret_access_key = "' +
    "wJalrXUtnFEMI/K7MDENG/bPxRfiCY" +
    "1234567890" +
    '"',

  // ── GitHub ──
  githubPat: "ghp" + "_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij",
  githubFineGrained:
    "github" +
    "_pat_" +
    "11AAAAAAAAA00000000000" +
    "_" +
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb",

  // ── Stripe ──
  stripeLiveSecret: "sk" + "_live_" + "51HG4abcdefghijklmnopqrstu",
  stripeTestSecret: "sk" + "_test_" + "51HG4abcdefghijklmnopqrstu",
  stripeRestrictedKey: "rk" + "_live_" + "51HG4abcdefghijklmnopqrstu",
  stripeLivePublishable: "pk" + "_live_" + "51HG4abcdefghijklmnopqrstu",
  stripeTestPublishable: "pk" + "_test_" + "51HG4abcdefghijklmnopqrstu",
  stripeWebhookSecret: "whsec_" + "5WbX5kEWLlfzsGNjH64I8lOOqUB6e8FH",

  // ── OpenAI ──
  openaiKeyV1:
    "sk" +
    "-" +
    "abcdefghijklmnopqrst" +
    "T3Bl" +
    "bkFJ" +
    "uvwxyz1234567890abcd",
  openaiKeyV2:
    "sk" +
    "-proj-" +
    "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv",

  // ── Anthropic ──
  anthropicKey:
    "sk" +
    "-ant-api03-" +
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234",

  // ── Google ──
  googleApiKey: "AI" + "zaSyA1234567890abcdefghijklmnopqrstuv",

  // ── Database ──
  databaseUrl:
    "postgresql://admin:s3cretP4ssw0rd@db.example.com:5432/mydb",
  mongoUrl:
    "mongodb+srv://user:p4ssword@cluster.example.com/mydb",

  // ── SSH ──
  sshPrivateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AhZ3SCwCHH7FAKE
-----END RSA PRIVATE KEY-----`,

  // ── JWT ──
  jwt: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5cABCDEFGH",

  // ── Vercel ──
  vercelPat: "vcp_" + "BQuu9ChDu3n6Pfh6YQnCshpoYkWDSFKogLqmBtQ0tC8NAA5rXt340sjz",
  vercelBlobToken: "vercel_blob_rw_" + "cE0rCu23vRrdzQaP" + "_" + "AbCd1234EfGhIjKl5678MnOp",

  // ── Slack ──
  slackBotToken: "xoxb-" + "123456789012-1234567890123-AbCdEfGhIjKlMnOpQrStUvWx",
  slackAppToken: "xapp-" + "1-AAABBB111222333-444-aabbccddee5566778899",
  slackWebhookUrl:
    "https://hooks.slack.com/services/" + "T01234567/B01234567/AbCdEfGhIjKlMnOpQrStUvWx",

  // ── SendGrid ──
  sendgridKey: "SG." + "abcdefghijklmnopqrstuv" + "." + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr",

  // ── Shopify ──
  shopifyToken: "shpat_" + "aabbccdd11223344556677889900ffee",

  // ── Twilio ──
  twilioAccountSid:
    'account_sid = "' + "AC" + '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"',
  twilioApiKeySid: "SK" + "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",

  // ── DigitalOcean ──
  digitaloceanPat: "dop_v1_" + "aabbccdd11223344556677889900aabbccdd11223344556677889900aabbccdd",

  // ── npm ──
  npmToken: "npm_" + "abcdefghijklmnopqrstuvwxyz1234567890",

  // ── PyPI ──
  pypiToken: "pypi-AgEIcHlwaS5vcmc" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",

  // ── HashiCorp Vault ──
  vaultToken: "hvs." + "A".repeat(100),

  // ── Doppler ──
  dopplerToken: "dp.pt." + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0",

  // ── Linear ──
  linearApiKey: "lin_api_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0",

  // ── Grafana ──
  grafanaToken: "glsa_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef" + "_" + "1a2b3c4d",

  // ── New Relic ──
  newrelicKey: "NRAK-" + "abc123def456ghi789jkl012mno",

  // ── Heroku ──
  herokuToken: "HRKU-AA" + "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",

  // ── PlanetScale ──
  planetscaleToken: "pscale_tkn_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef01234567",

  // ── Docker Hub ──
  dockerPat: "dckr_pat_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZab",

  // ── Resend ──
  resendKey: "re_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij",

  // ── Supabase ──
  supabaseKey: "sb_secret_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh",

  // ── Netlify ──
  netlifyToken: "nfp_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn",

  // ── Appwrite ──
  appwriteKey: "standard_" + "a".repeat(256),

  // ── Cloudflare ──
  cloudflareOriginCaKey: "v1.0-" + "a1b2c3d4e5f6a1b2c3d4e5f6" + "-" + "a".repeat(146),

  // ── Discord ──
  discordWebhookUrl: "https://discord.com/api/webhooks/1234567890123456789/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop",
};

export const FALSE_POSITIVES = {
  // AWS example from docs (allowlisted)
  awsExampleKey: "AKIA" + "IOSFODNN7EXAMPLE",
  // Random-looking strings that are NOT secrets
  hexString: "0123456789abcdef0123456789abcdef01234567",
  base64Padding: "dGhpcyBpcyBhIHRlc3Q=",
  // Stripe test keys (allowlisted example from Stripe docs)
  stripeTestKey: "sk" + "_test_" + "4eC39HqLyjWDarjtT1zdp7dc",
  // Short JWT-like string without enough entropy
  shortToken: "eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.abc",
  // URL that looks like DB but has no password
  dbUrlNoPassword: "postgresql://admin@db.example.com:5432/mydb",
  // Generic config values
  configValue: 'API_KEY = "not-a-real-key"',
  // Short strings that shouldn't match (body too short for pattern minimums)
  stripeShortBody: "sk" + "_live_" + "abc",
  // Twilio example SID from docs (allowlisted)
  twilioExampleSid: "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  // DB URL with placeholder password (filtered by validate function)
  dbUrlPlaceholderPassword: "postgresql://user:password@db.example.com:5432/mydb",
  // DB URL with template variable (filtered by validate function)
  dbUrlTemplatePassword: "postgresql://user:${DB_PASSWORD}@db.example.com:5432/mydb",
  // Bare Twilio Account SID without context keyword (no longer matches)
  twilioBareSid: "AC" + "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
  // Variable name starting with re_ that contains underscores (should not match Resend)
  resendLikeVariable: "re_" + "some_long_variable_name_with_undersco",
  // JWT-like string where header has no alg field (filtered by validate)
  jwtNoAlg: "eyJub3RhbGciOiJ0ZXN0In0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV",
  // Short Slack token body (< 20 chars, below minimum)
  slackShortBody: "xoxb-" + "12345678901234",
};

/**
 * Multi-secret text for testing multiple detections in one payload.
 */
export const MULTI_SECRET_TEXT = `
Here are my credentials:
AWS_ACCESS_KEY_ID=${TRUE_POSITIVES.awsAccessKeyId}
${TRUE_POSITIVES.awsSecretAccessKey}
GITHUB_TOKEN=${TRUE_POSITIVES.githubPat}
DATABASE_URL=${TRUE_POSITIVES.databaseUrl}
`;
