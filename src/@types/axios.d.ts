declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, any>;
    timeout?: number;
    withCredentials?: boolean;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosRequestConfig;
  }

  export interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    interceptors: {
      request: {
        use: (
          fulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig,
          rejected?: (error: any) => any
        ) => number;
      };
      response: {
        use: (
          fulfilled: (response: AxiosResponse) => AxiosResponse,
          rejected?: (error: any) => any
        ) => number;
      };
    };
  }

  export interface InternalAxiosRequestConfig extends AxiosRequestConfig {
    headers: Record<string, string>;
  }

  export const create: (config?: AxiosRequestConfig) => AxiosInstance;

  declare const axios: AxiosInstance;
  export default axios;
}
