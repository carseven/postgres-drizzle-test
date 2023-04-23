type ENVIRONMENT_KEYS = [];

type TupleToObject<T extends readonly string[]> = {
  [P in T[number]]: string;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_HOST: string;
      DATABASE_NAME: string;
      DATABASE_PORT: string;
      DATABASE_USER: string;
      DATABASE_USER_PASSWORD: string;
    }
  }
}
export {};
