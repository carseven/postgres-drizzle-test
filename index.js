import { connect } from "@planetscale/database";
import { config } from "dotenv";
import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { createServer } from "http";

// Load environment variables
config();

// create the connection
console.log("[DB] - Starting database connection");
const connection = connect({
  url: process.env.DATABASE_URL,
});
const db = drizzle(connection);

export const urlShortener = mysqlTable("url_shortener", {
  route: varchar("route", { length: 100 }).primaryKey(),
  url: varchar("url", { length: 1000 }),
});
console.log("[DB] - Database connection stablish");

// Reference: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction
createServer(async (request, response) => {
  const { headers, method, url } = request;
  switch (method) {
    case "GET":
      const allUrls = await db.select().from(urlShortener);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write(JSON.stringify(allUrls));
      response.end();
      break;
    case "POST":
      let bodyChunks = []; // : Uint8Array[]
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

          const userToAdd = JSON.parse(body);

          // TODO: Validate input with ZOD
        });
      break;
    default:
      response.writeHead(405);
      response.end();
  }
}).listen("3000", async () => {
  console.log("[Server] - Starting server at http://localhost:3000");
});
