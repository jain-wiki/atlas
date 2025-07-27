// Standardized response formats for consistent API responses

export interface ApiSuccessResponse<T = any> {
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: any;
  timestamp: string;
}

// Helper function to create success responses
export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => {
  return {
    data,
    timestamp: new Date().toISOString(),
  };
};

// Helper function to create error responses
export const createErrorResponse = (error: string, details?: any): ApiErrorResponse => {
  return {
    error,
    details,
    timestamp: new Date().toISOString(),
  };
};

// Common error messages
export const ErrorMessages = {
  UNAUTHORIZED: "Unauthorized access",
  NOT_FOUND: "Resource not found",
  VALIDATION_FAILED: "Validation failed",
  INTERNAL_ERROR: "Internal server error",
  USER_EMAIL_MISSING: "User email not found",
  PLACE_NOT_FOUND: "Place not found",
  INVALID_REQUEST: "Invalid request",
} as const;
