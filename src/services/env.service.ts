import { config } from 'dotenv';
import { z } from 'zod';

export const loggerModes = ['INFO', 'ERROR', 'WARN'] as const;
const EnvApp = z.object({
    DATABASE_URL: z.string().url(),
    LOGGER_MODE: z.enum(loggerModes),
});
export type EnvAppVars = z.infer<typeof EnvApp>;

export class EnvService {
    public env: unknown;
    constructor() {
        this.loadEnvironmentVariables();
    }

    /**
     * Load and validate environment variables.
     * @throws Error if loading env went wrong or not pass validations
     */
    private loadEnvironmentVariables(): void {
        config();
        this.env = process.env;
        EnvApp.parse(this.env);
    }
}
