import { connect } from '@planetscale/database';
import { PlanetScaleDatabase, drizzle } from 'drizzle-orm/planetscale-serverless';

export class DbHelper {
    public db!: PlanetScaleDatabase;
    constructor() {
        this.init();
    }

    private init(): void {
        const connection = connect({
            url: process.env.DATABASE_URL,
        });
        this.db = drizzle(connection);
    }
}
