import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const urlShortener = mysqlTable('url_shortener', {
    route: varchar('route', { length: 100 }).primaryKey(),
    url: varchar('url', { length: 1000 }),
});
