import { createServer } from 'http';
import { DbHelper } from './db/db-helper';
import { EnvService } from './services/env.service';
import { LoggerService } from './services/logger.service';
import { CreateUrlShortener, UrlShortenerService } from './services/url-shortener.service';

new EnvService();
const loggerService = new LoggerService();
loggerService.loggerMode = process.env.LOGGER_MODE;
const dbHelper = new DbHelper();
const urlShortenerService = new UrlShortenerService(dbHelper, loggerService);

// Reference: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction
createServer(async (request, response) => {
    const { headers, method, url } = request;
    switch (method) {
        case 'GET': {
            if (!url) {
                response.writeHead(404);
                response.end();
                break;
            }

            const urlToRedirect = await urlShortenerService.getUrlRedirectFromRoute(url);
            if (urlToRedirect) {
                console.log(`${url} redirect to ${urlToRedirect}`);
                response.setHeader('Location', urlToRedirect);
                response.writeHead(308);
            } else {
                console.warn(`${url} no exist on DB`);
                response.writeHead(404);
            }
            response.end();
            break;
        }
        case 'POST': {
            const bodyChunks: Uint8Array[] = [];
            request
                .on('data', (chunk) => {
                    bodyChunks.push(chunk);
                })
                .on('end', async () => {
                    const body = Buffer.concat(bodyChunks).toString();

                    response.on('error', (err) => {
                        loggerService.error(err);
                    });

                    let rawDto: unknown;
                    try {
                        rawDto = JSON.parse(body);
                    } catch (error: unknown) {
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
                    const result = await urlShortenerService.createUrlRedirect(validatedDto.data);

                    if (!result.success) {
                        loggerService.error(result.errorMessage);
                        response.writeHead(500);
                        response.end();
                        return;
                    }

                    response.writeHead(200);
                    response.end();
                });
            break;
        }
        default:
            response.writeHead(405);
            response.end();
    }
}).listen('3000', async () => {
    console.log('[Server] - Starting server at http://localhost:3000');
});