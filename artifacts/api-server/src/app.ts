import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import uploadsRouter from "./routes/uploads";
import { logger } from "./lib/logger";
import { env } from "./lib/env";
import { globalErrorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const corsOptions: cors.CorsOptions =
  env.ALLOWED_ORIGIN === "*"
    ? { origin: "*" }
    : {
        origin: env.ALLOWED_ORIGIN.split(",").map((o) => o.trim()),
        credentials: true,
      };
app.use(cors(corsOptions));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, please try again later." },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many write requests, please slow down." },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api", generalLimiter);
app.use("/api", (req, _res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    writeLimiter(req, _res, next);
  } else {
    next();
  }
});

app.use("/api", uploadsRouter);
app.use("/api", router);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
