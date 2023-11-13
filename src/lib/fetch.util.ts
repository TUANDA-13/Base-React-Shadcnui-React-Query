import _isEmpty from "lodash/isEmpty";
import _get from "lodash/get";

// import { Configs, FetchResponse, MainConfigs } 
import { Nullable } from "@/types/nullable.type"; 
import { objectLevel1Type } from "@/types/object.type";

import { API_METHOD_ENUM } from "@/enums/fetch.enum";
import { valueType } from "./value-type.util";
import { Configs, FetchResponse, MainConfigs } from "@/types/fetch.type";
// import { removeAllCookies } from "./helper.util";

// Regular expression patterns for testing content-type response headers.
const RE_CONTENT_TYPE_JSON = new RegExp("^application/(x-)?json", "i");
const RE_CONTENT_TYPE_TEXT = new RegExp("^text/", "i");

// Static strings.
const UNEXPECTED_ERROR_MESSAGE = "An unexpected error occurred while processing your request.";

const HEADERS_DEFAULT = {
  Accept: "application/json",
  "Content-Type": "application/json"
};

class FetchClient {
  baseUrl = "";
  timeout = 3000;

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  public delete<T>(url: string, config?: Configs) {
    return this.makeRequest<T>(
      url,
      null,
      Object.assign({ method: API_METHOD_ENUM.DELETE }, config)
    );
  }

  public get<T>(url: string, config?: Configs) {
    return this.makeRequest<T>(url, null, Object.assign({ method: API_METHOD_ENUM.GET }, config));
  }

  public post<T>(url: string, data?: any, config?: Configs) {
    return this.makeRequest<T>(url, data, Object.assign({ method: API_METHOD_ENUM.POST }, config));
  }

  public put<T>(url: string, data?: any, config?: Configs) {
    return this.makeRequest<T>(url, data, Object.assign({ method: API_METHOD_ENUM.PUT }, config));
  }

  public patch<T>(url: string, data?: any, config?: Configs) {
    return this.makeRequest<T>(url, data, Object.assign({ method: API_METHOD_ENUM.PATCH }, config));
  }

  protected async makeRequest<T>(
    url: string,
    data: any,
    config: MainConfigs
  ): Promise<FetchResponse<T>> {
    const abortController = new AbortController();

    const method: API_METHOD_ENUM = config.method;
    const headers: HeadersInit = config.headers || HEADERS_DEFAULT;

    let body;
    let queryString = "";

    if (this.baseUrl && valueType(url) === "string" && url.startsWith("/")) {
      url = this.baseUrl + url;
    }

    if (!_isEmpty(config.params)) {
      queryString = "?" + this.getQueryString(config.params as objectLevel1Type);
      url = url + queryString;
    }

    if (
      [API_METHOD_ENUM.PATCH, API_METHOD_ENUM.POST, API_METHOD_ENUM.PUT].indexOf(method) > -1 &&
      !!data
    ) {
      if (_get(headers, "Content-Type") === "application/json") {
        body = JSON.stringify(data);
      } else {
        body = data;
      }
    }

    try {
      const id = setTimeout(() => abortController.abort(), config.timeout || this.timeout);

      const response: Response = await fetch(url, {
        method,
        headers,
        body,
        signal: abortController.signal
      });

      clearTimeout(id);

      const data: T = await this.unwrapResponseData(response);

      if (response.ok) {
        const responseData: FetchResponse<T> = {
          data,
          status: {
            code: response.status,
            text: response.statusText,
            isAbort: false
          },
          headers: Object.fromEntries(response.headers.entries()),
          response: response
        };

        return responseData;
      }
      return Promise.reject(this.normalizeError(url, data, response));
    } catch (error: any) {
      return Promise.reject(this.normalizeTransportError(error));
    }
  }

  /**
   * I unwrap the response payload from the given response based on the reported
   * content-type.
   */
  private async unwrapResponseData(response: Response) {
    const contentType: Nullable<string> = response.headers.has("content-type")
      ? response.headers.get("content-type")
      : "";

    if (contentType && RE_CONTENT_TYPE_JSON.test(contentType)) {
      return response.json();
    } else if (contentType && RE_CONTENT_TYPE_TEXT.test(contentType)) {
      return response.text();
    } else {
      return response.blob();
    }
  }

  private getQueryString(params: objectLevel1Type): string {
    const esc = encodeURIComponent;

    return Object.keys(params)
      .map((k) => esc(k) + "=" + esc(params[k]))
      .join("&");
  }

  private normalizeError<T>(url: string, data: T, fetchResponse: Response): FetchResponse<T> {
    console.log(url, data, fetchResponse)
    const error: FetchResponse<T> = {
      data,
      status: {
        code: fetchResponse.status,
        text: fetchResponse.statusText,
        isAbort: false
      },
      headers: Object.fromEntries(fetchResponse.headers.entries()),
      response: fetchResponse
    };
    if (error?.status?.code >= 500) {
      window.location.replace("/load-fail");
    }

    if (error?.status?.code === 401) {
      // removeAllCookies();
      // window.location.replace("/login");
    }
    return error;
  }

  private normalizeTransportError<T>(error: DOMException): FetchResponse<T> {
    return {
      data: {
        type: "TransportError",
        message: UNEXPECTED_ERROR_MESSAGE,
        rootCause: error
      } as any,
      status: {
        code: 0,
        text: "Unknown",
        isAbort: error.name === "AbortError"
      }
    };
  }
}

export default FetchClient;
