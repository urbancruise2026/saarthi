import { ApiError } from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = err.message || "Something went wrong";
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: err.error || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  res.status(statusCode).json(response);
};

export { errorMiddleware };
