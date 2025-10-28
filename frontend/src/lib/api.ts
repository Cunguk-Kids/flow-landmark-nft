/**
 * API Client for Flow Event Backend
 * Base URL: http://localhost:6666
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6666";

/**
 * Custom error class for API errors
 */
export class ApiError<T = unknown> extends Error {
  status: number;
  data?: T;
  constructor(
    message: string,
    status: number,
    data?: T, 
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // Parse response body
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || "An error occurred",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError("Network error. Please check your connection.", 0);
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      0
    );
  }
}

/**
 * API Client methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "DELETE" }),
};
