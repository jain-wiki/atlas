import type { Context, Next } from "hono";

// Standard error response format
interface ErrorResponse {
  error: string;
  details?: any;
  timestamp: string;
}

// Standard success response format
interface SuccessResponse<T = any> {
  data: T;
  timestamp: string;
}

export const errorHandler = async (err: Error, c: Context) => {
  console.error("Error:", err);

  const errorResponse: ErrorResponse = {
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  };

  // Handle different types of errors
  if (err.name === "ValidationError") {
    return c.json(errorResponse, 400);
  }

  if (err.name === "UnauthorizedError") {
    return c.json({ ...errorResponse, error: "Unauthorized" }, 401);
  }

  if (err.name === "NotFoundError") {
    return c.json({ ...errorResponse, error: "Not found" }, 404);
  }

  // Default to 500 for unknown errors
  return c.json(errorResponse, 500);
};

// Helper functions for consistent responses
export const successResponse = <T>(data: T, status: number = 200) => {
  return {
    data,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (error: string, details?: any, status: number = 400) => {
  return {
    error,
    details,
    timestamp: new Date().toISOString(),
  };
};
