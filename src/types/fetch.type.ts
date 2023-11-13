import { API_METHOD_ENUM } from "enums/fetch.enum";

export type Configs = {
  timeout?: number;
  headers?: HeadersInit;
  params?: object;
};

export type MainConfigs = {
  method: API_METHOD_ENUM;
} & Configs;

export type BaseResponse = {
  status: {
    code: number;
    text: string;
    isAbort: boolean;
  };
  headers?: any;
  request?: any;
  response?: any;
};

export type FetchResponse<T = any> = {
  data: T;
} & BaseResponse;

export type GetInfinitePagesInterface<T> = {
  nextId?: number;
  previousId?: number;
  data: T;
  count: number;
};
