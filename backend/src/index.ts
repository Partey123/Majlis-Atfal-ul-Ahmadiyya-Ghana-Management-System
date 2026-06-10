import "./lib/env";
import app from "./app";
import { logger } from "./lib/logger";
import { env } from "./lib/env";

const port = Number(env.PORT);

if (Number.isNaN(port) || port <= 0) {
  logger.error(`Invalid PORT value: "${env.PORT}"`);
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port, env: env.NODE_ENV }, "Server listening");
});
