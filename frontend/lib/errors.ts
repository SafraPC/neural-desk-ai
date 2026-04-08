export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

export function isUnauthorizedError(error: unknown) {
  return Boolean(
    error && typeof error === "object" && "status" in error && typeof error.status === "number" && error.status === 401,
  );
}
