import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error: {
    code?: string;
    message: string;
  };
}

export function getErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorResponse | undefined;
    return data?.error?.message || defaultMessage;
  }
  return defaultMessage;
}

export function getErrorCode(err: unknown): string | undefined {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorResponse | undefined;
    return data?.error?.code;
  }
  return undefined;
}
