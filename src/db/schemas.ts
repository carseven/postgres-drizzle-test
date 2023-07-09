import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const urlShortener = mysqlTable('url_shortener', {
    route: varchar('route', { length: 100 }).primaryKey(),
    url: varchar('url', { length: 1000 }),
});

export const users = mysqlTable('users', {
    id: varchar('id', { length: 100 }).primaryKey(),
    email: varchar('email', { length: 1000 }).notNull(),
    password: varchar('password', { length: 1000 }).notNull(),
});
