import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = new Client({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_USER_PASSWORD,
  connectionTimeoutMillis: 10000,
  ssl: true,
});

(async () => {
  await client.connect();
  console.log("Motus database connected!");

  const user = pgTable("user", {
    userId: serial("userid").primaryKey(),
    firstName: varchar("firstname", { length: 100 }),
    secondName: varchar("secondname", { length: 100 }),
  });

  const db = drizzle(client);

  const allUsers = await db.select().from(user);
  console.timeEnd();
  console.log(allUsers);

  console.time();
  await db.insert(user).values([
    {
      userId: +(allUsers[allUsers.length - 1]?.userId || 0) + 1,
      firstName: "Noe",
      secondName: "Sanchez",
    },
  ]);
  console.timeEnd();
  await client.end();
})();
