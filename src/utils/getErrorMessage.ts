export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "An unknown error occurred";

  const err = error as Record<string, unknown>;

  const message =
    (err.response as Record<string, unknown>)?.data instanceof Object
      ? ((err.response as any).data.message ?? (err.response as any).data.error)
      : null;

  const finalMessage = message ?? err.message ?? err.msg ?? err.error;

  if (typeof finalMessage === "string") return finalMessage;

  if (error instanceof Error) return error.message;

  return "An unknown error occurred";
};
