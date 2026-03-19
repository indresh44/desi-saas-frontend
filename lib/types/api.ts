export type ApiError = {
  message: string;
  status: number;
};

export type ApiResult<T> = {
  data: T;
  status: number;
};