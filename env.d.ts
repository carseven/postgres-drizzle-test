type SecretKeys =
  | "DATABASE_HOST"
  | "DATABASE_NAME"
  | "DATABASE_PORT"
  | "DATABASE_USER"
  | "DATABASE_USER_PASSWORD";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<SecretKeys, string> {}
  }
}
export {};
