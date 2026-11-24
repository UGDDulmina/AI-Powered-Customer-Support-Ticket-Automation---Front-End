
import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Check your connection.";
    }

    const status = error.response.status;
    const detail = error.response.data?.detail;

    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (status === 404) {
      return typeof detail === "string"
        ? detail
        : "The requested resource was not found.";
    }

    if (status === 422) {
      return "Invalid request data. Please check your inputs.";
    }

    if (status >= 500) {
      return "A server error occurred. Please try again later.";
    }

    return typeof detail === "string"
      ? detail
      : `Request failed (${status}).`;
  }

  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}
