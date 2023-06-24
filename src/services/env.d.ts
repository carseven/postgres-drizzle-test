import { EnvAppVars } from './env.service';

declare global {
    namespace NodeJS {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ProcessEnv extends EnvAppVars {}
    }
}
export {};
