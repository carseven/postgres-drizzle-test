type SecretKeys = "DATABASE_URL";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<SecretKeys, string> {}
  }
}
export {};
