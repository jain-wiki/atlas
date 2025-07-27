// Ref: https://app.studyraid.com/en/read/11303/352723/error-handling-middleware

import type { ApiResponse } from '@jamku/types';
import type { Context } from 'hono'

export async function errorHandler(err: Error, c: Context) {
  // Log the error for debugging purposes
  console.error('Error occurred:', err.name, err)

  let customMsg = err.message || 'Internal Server Error';

  const errorName = err.name
  switch (errorName) {
    case 'CastError': // Mongoose CastError
      customMsg = 'Invalid ID';
      break;
    default:
      break;
  }

  // Set appropriate status code and response
  const response: ApiResponse = {
    success: false,
    message: `${errorName}: ${customMsg}`,
    error: customMsg,
    show: true
  }
  return c.json(response)

}


// Helper functions for consistent responses
export const successResponse = <T>(data: T) => {
  return {
    data,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (error: string, details?: any) => {
  return {
    error,
    details,
    timestamp: new Date().toISOString(),
  };
};
