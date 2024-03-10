export type TResponse<T> = {
  success: boolean;
  result: T | null;
  message: string | null;
};

export type TExceptionResponse = string | { message: string; error?: string };
