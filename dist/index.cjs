"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var import_http = require("http");

// src/db/db-helper.ts
var import_database = require("@planetscale/database");
var import_planetscale_serverless = require("drizzle-orm/planetscale-serverless");
var DbHelper = class {
  constructor() {
    this.init();
  }
  init() {
    const connection = (0, import_database.connect)({
      url: process.env.DATABASE_URL
    });
    this.db = (0, import_planetscale_serverless.drizzle)(connection);
  }
};

// src/services/env.service.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
var loggerModes = ["INFO", "ERROR", "WARN"];
var EnvApp = import_zod.z.object({
  DATABASE_URL: import_zod.z.string().url(),
  LOGGER_MODE: import_zod.z.enum(loggerModes)
});
var EnvService = class {
  constructor() {
    this.loadEnvironmentVariables();
  }
  /**
   * Load and validate environment variables.
   * @throws Error if loading env went wrong or not pass validations
   */
  loadEnvironmentVariables() {
    (0, import_dotenv.config)();
    this.env = process.env;
    EnvApp.parse(this.env);
  }
};

// src/services/logger.service.ts
var LoggerService = class {
  constructor() {
    // By default only show error logs
    this.loggerMode = "ERROR";
  }
  info(message) {
    if (this.loggerMode === "INFO") {
      console.log(`[INFO] ${message}`);
    }
  }
  warn(message) {
    if (this.loggerMode === "INFO" || this.loggerMode === "WARN") {
      console.warn(`[WARN] ${message}`);
    }
  }
  error(message) {
    console.error(`[ERROR] ${message}`);
  }
};

// src/services/url-shortener.service.ts
var import_drizzle_orm = require("drizzle-orm");
var import_zod2 = require("zod");

// src/db/schemas.ts
var import_mysql_core = require("drizzle-orm/mysql-core");
var urlShortener = (0, import_mysql_core.mysqlTable)("url_shortener", {
  route: (0, import_mysql_core.varchar)("route", { length: 100 }).primaryKey(),
  url: (0, import_mysql_core.varchar)("url", { length: 1e3 })
});

// src/services/url-shortener.service.ts
var CreateUrlShortener = import_zod2.z.object({
  route: import_zod2.z.string().max(100),
  url: import_zod2.z.string().max(1e3).url()
});
var UrlShortenerService = class {
  constructor(dbHelper2, loggerService2) {
    this.dbHelper = dbHelper2;
    this.loggerService = loggerService2;
  }
  getUrlRedirectFromRoute(route) {
    return __async(this, null, function* () {
      var _a;
      try {
        const urlsToRedirect = yield this.dbHelper.db.select({
          url: urlShortener.url
        }).from(urlShortener).where((0, import_drizzle_orm.eq)(urlShortener.route, route || "")).limit(1);
        return ((_a = urlsToRedirect[0]) == null ? void 0 : _a.url) || null;
      } catch (error) {
        this.loggerService.error(error);
        return null;
      }
    });
  }
  createUrlRedirect(dto) {
    return __async(this, null, function* () {
      try {
        const result = yield this.dbHelper.db.insert(urlShortener).values({
          route: dto.route,
          url: dto.url
        });
        if (result.rowsAffected > 0) {
          return {
            success: true
          };
        } else {
          return {
            success: false,
            errorMessage: "Error inserting URL"
          };
        }
      } catch (error) {
        this.loggerService.error(error);
        return {
          success: false,
          errorMessage: "Error inserting URL"
        };
      }
    });
  }
};

// src/index.ts
new EnvService();
var loggerService = new LoggerService();
loggerService.loggerMode = process.env.LOGGER_MODE;
var dbHelper = new DbHelper();
var urlShortenerService = new UrlShortenerService(dbHelper, loggerService);
(0, import_http.createServer)((request, response) => __async(void 0, null, function* () {
  const { headers, method, url } = request;
  switch (method) {
    case "GET": {
      if (!url) {
        response.writeHead(404);
        response.end();
        break;
      }
      const urlToRedirect = yield urlShortenerService.getUrlRedirectFromRoute(url);
      if (urlToRedirect) {
        console.log(`${url} redirect to ${urlToRedirect}`);
        response.setHeader("Location", urlToRedirect);
        response.writeHead(308);
      } else {
        console.warn(`${url} no exist on DB`);
        response.writeHead(404);
      }
      response.end();
      break;
    }
    case "POST": {
      const bodyChunks = [];
      request.on("data", (chunk) => {
        bodyChunks.push(chunk);
      }).on("end", () => __async(void 0, null, function* () {
        const body = Buffer.concat(bodyChunks).toString();
        response.on("error", (err) => {
          loggerService.error(err);
        });
        let rawDto;
        try {
          rawDto = JSON.parse(body);
        } catch (error) {
          loggerService.error(error);
          response.writeHead(500);
          response.end();
          return;
        }
        const validatedDto = CreateUrlShortener.safeParse(rawDto);
        if (!validatedDto.success) {
          loggerService.error(validatedDto.error);
          response.writeHead(500);
          response.end();
          return;
        }
        const result = yield urlShortenerService.createUrlRedirect(validatedDto.data);
        if (!result.success) {
          loggerService.error(result.errorMessage);
          response.writeHead(500);
          response.end();
          return;
        }
        response.writeHead(200);
        response.end();
      }));
      break;
    }
    default:
      response.writeHead(405);
      response.end();
  }
})).listen("3000", () => __async(void 0, null, function* () {
  console.log("[Server] - Starting server at http://localhost:3000");
}));
