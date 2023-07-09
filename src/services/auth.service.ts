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
