export const getErrorMessage = (error: unknown): string => {
  if (!error) return "未知错误";

  if (error instanceof Error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const obj = error as Record<string, any>;
    if (obj.message) return String(obj.message);
    if (obj.msg) return String(obj.msg);
    if (obj.error) return String(obj.error);
  }

  return String(error);
};
