import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "../lib/logger";

export interface ApiErrorResponse {
  status: "error";
  message: string;
  code?: string;
}

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ status: "error", message: "Route not found" } satisfies ApiErrorResponse);
};

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const error = err instanceof Error ? err : new Error(String(err));

  logger.error({ err: error }, "Unhandled server error");

  const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
  const code = (err as { code?: string }).code;

  res.status(statusCode).json({
    status: "error",
    message: statusCode === 500 ? "Internal server error" : error.message,
    ...(code ? { code } : {}),
  } satisfies ApiErrorResponse);
};
