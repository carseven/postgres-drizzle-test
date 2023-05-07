import { Client } from "pg";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import * as dotenv from "dotenv";

import { createServer } from "http";

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

let db: NodePgDatabase;
const user = pgTable("user", {
  userId: serial("userid").primaryKey(),
  firstName: varchar("firstname", { length: 100 }),
  secondName: varchar("secondname", { length: 100 }),
});

async function connectToDatabase() {
  await client.connect();
  db = drizzle(client);
}

// Reference: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction
createServer(async (request, response) => {
  const { headers, method, url } = request;

  switch (method) {
    case "GET":
      console.log("GET request");
      const allUsers = await db.select().from(user);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write(JSON.stringify(allUsers));
      console.log(allUsers);
      response.end();
      break;
    case "POST":
      let bodyChunks: Uint8Array[] = [];
      request
        .on("data", (chunk) => {
          bodyChunks.push(chunk);
        })
        .on("end", async () => {
          const body = Buffer.concat(bodyChunks).toString();

          response.on("error", (err) => {
            console.error(err);
          });

          response.writeHead(200, { "Content-Type": "application/json" });

          const responseBody = { headers, method, url, body };

          const userToAdd = JSON.parse(body) as {
            firstName: string;
            secondName: string;
          };

          // TODO: Validate input with ZOD
          if (!userToAdd.firstName || !userToAdd.secondName) {
            response.writeHead(404);
            response.end();
            return;
          }

          const allUsers = await db.select().from(user);
          await db.insert(user).values([
            {
              userId: +(allUsers[allUsers.length - 1]?.userId || 0) + 1,
              firstName: userToAdd.firstName,
              secondName: userToAdd.secondName,
            },
          ]);

          response.end(
            JSON.stringify({
              userId: +(allUsers[allUsers.length - 1]?.userId || 0) + 1,
              firstName: userToAdd.firstName,
              secondName: userToAdd.secondName,
            })
          );
        });
      break;
    default:
      response.writeHead(405);
      response.end();
  }
}).listen("3000", async () => {
  console.log("[Server] - Starting server at http://localhost:3000");
  console.log("[DB] - Starting database connection");
  await connectToDatabase();
  console.log("[DB] - Database connection stablish");
});
