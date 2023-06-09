import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { DbHelper } from '../db/db-helper';
import { urlShortener } from '../db/schemas';
import { Result } from './definitions';
import { LoggerService } from './logger.service';

const RouteValidator = {
    route: z.string().max(100),
};
export const CreateUrlShortener = z.object({
    ...RouteValidator,
    url: z.string().max(1000).url(),
});
export type CreateUrlShortenerDto = z.infer<typeof CreateUrlShortener>;
export const DeleteUrlShortener = z.object({
    ...RouteValidator,
});
export type DeleteUrlShortenerDto = z.infer<typeof DeleteUrlShortener>;

export class UrlShortenerService {
    constructor(
        private readonly dbHelper: DbHelper,
        private readonly loggerService: LoggerService,
    ) {}

    public async getUrlRedirectFromRoute(route: string): Promise<string | null> {
        try {
            const urlsToRedirect = await this.dbHelper.db
                .select({
                    url: urlShortener.url,
                })
                .from(urlShortener)
                .where(eq(urlShortener.route, route || ''))
                .limit(1);
            return urlsToRedirect[0]?.url || null;
        } catch (error: unknown) {
            this.loggerService.error(error);
            return null;
        }
    }

    public async createUrlRedirect(dto: { route: string; url: string }): Promise<Result> {
        try {
            const result = await this.dbHelper.db.insert(urlShortener).values({
                route: dto.route,
                url: dto.url,
            });
            if (result.rowsAffected > 0) {
                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                    errorMessage: 'Error inserting URL',
                };
            }
        } catch (error: unknown) {
            this.loggerService.error(error);
            return {
                success: false,
                errorMessage: 'Error inserting URL',
            };
        }
    }

    public async updateUrlRedirect(dto: { route: string; url: string }): Promise<Result> {
        try {
            const result = await this.dbHelper.db
                .update(urlShortener)
                .set({
                    url: dto.url,
                })
                .where(eq(urlShortener.route, dto.route));
            if (result.rowsAffected > 0) {
                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                    errorMessage: 'Error updating URL',
                };
            }
        } catch (error: unknown) {
            this.loggerService.error(error);
            return {
                success: false,
                errorMessage: 'Error updating URL',
            };
        }
    }

    public async deleteUrlRedirect(dto: { route: string }): Promise<Result> {
        try {
            const result = await this.dbHelper.db
                .delete(urlShortener)
                .where(eq(urlShortener.route, dto.route));
            if (result.rowsAffected > 0) {
                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                    errorMessage: 'Error inserting URL',
                };
            }
        } catch (error: unknown) {
            this.loggerService.error(error);
            return {
                success: false,
                errorMessage: 'Error inserting URL',
            };
        }
    }
    // TODO: Implement delete route
}
