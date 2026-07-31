export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  requestId: string;
  error?: {
    code: string;
    details?: any;
  };
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
