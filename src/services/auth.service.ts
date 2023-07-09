import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { DbHelper } from '../db/db-helper';
import { users } from '../db/schemas';
import { LoggerService } from './logger.service';

export const AuthRequest = z.object({
    email: z.string().max(100).email(),
    // TODO: Add more complex validation (Min, pattern, etc)
    password: z.string().max(100),
});

export type IAuth = z.infer<typeof AuthRequest>;

export class AuthService {
    constructor(
        private readonly dbHelper: DbHelper,
        private readonly loggerService: LoggerService,
    ) {}

    public async validateAuth(authorization: string | undefined): Promise<boolean> {
        if (!authorization) {
            return false;
        }

        const removedBearer = authorization.replace('Bearer', '').trim();

        // Transform from base64 to json
        let requestAuth: unknown;
        try {
            requestAuth = JSON.parse(Buffer.from(removedBearer, 'base64').toString());
        } catch (error) {
            console.error(error);
            return false;
        }

        // Validate schema with zod
        const authParsed = AuthRequest.safeParse(requestAuth);
        if (!authParsed.success) {
            return false;
        }

        // TODO: Encrypt password for security and implement session token and expiration policies
        // /login, refresh token and logout

        // Check valid auth (Probably good idea to add cache layer)
        const auth = authParsed.data;
        return await this.validateEmailAndPassword(auth.email, auth.password);
    }

    public async validateEmailAndPassword(email: string, password: string): Promise<boolean> {
        try {
            const user = await this.dbHelper.db
                .select({
                    userId: users.id,
                    email: users.email,
                    password: users.password,
                })
                .from(users)
                .where(eq(users.email, email))
                .limit(1);
            return user[0]?.password === password;
        } catch (error: unknown) {
            this.loggerService.error(error);
            return false;
        }
    }
}
