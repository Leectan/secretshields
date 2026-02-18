/**
 * Synthetic test secrets — NONE of these are real credentials.
 * They match the expected format patterns but are fabricated.
 */

export const TRUE_POSITIVES = {
  awsAccessKeyId: "AKIA" + "IOSFODNN7EXAMPL1",
  awsSecretAccessKey:
    'aws_secret_access_key = "' +
    "wJalrXUtnFEMI/K7MDENG/bPxRfiCY" +
    "1234567890" +
    '"',
  githubPat: "ghp" + "_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij",
  githubFineGrained:
    "github" +
    "_pat_" +
    "11AAAAAAAAA00000000000" +
    "_" +
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb",
  stripeLiveSecret: "sk" + "_live_" + "51HG4abcdefghijklmnopqrstu",
  stripeLivePublishable: "pk" + "_live_" + "51HG4abcdefghijklmnopqrstu",
  openaiKeyV1:
    "sk" +
    "-" +
    "abcdefghijklmnopqrst" +
    "T3Bl" +
    "bkFJ" +
    "uvwxyz1234567890abcd",
  openaiKeyV2:
    "sk" + "-proj-" + "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ",
  anthropicKey:
    "sk" +
    "-ant-api03-" +
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234",
  googleApiKey: "AI" + "zaSyA1234567890abcdefghijklmnopqrstuv",
  databaseUrl:
    "postgresql://admin:s3cretP4ssw0rd@db.example.com:5432/mydb",
  mongoUrl:
    "mongodb+srv://user:p4ssword@cluster.example.com/mydb",
  sshPrivateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AhZ3SCwCHH7FAKE
-----END RSA PRIVATE KEY-----`,
  jwt: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5cABCDEFGH",
};

export const FALSE_POSITIVES = {
  // AWS example from docs (allowlisted)
  awsExampleKey: "AKIA" + "IOSFODNN7EXAMPLE",
  // Random-looking strings that are NOT secrets
  hexString: "0123456789abcdef0123456789abcdef01234567",
  base64Padding: "dGhpcyBpcyBhIHRlc3Q=",
  // Stripe test keys (not live)
  stripeTestKey: "sk" + "_test_" + "4eC39HqLyjWDarjtT1zdp7dc",
  // Short JWT-like string without enough entropy
  shortToken: "eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.abc",
  // URL that looks like DB but has no password
  dbUrlNoPassword: "postgresql://admin@db.example.com:5432/mydb",
  // Generic config values
  configValue: 'API_KEY = "not-a-real-key"',
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
