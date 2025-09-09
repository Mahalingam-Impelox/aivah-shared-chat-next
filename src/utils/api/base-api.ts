import { AxiosRequestConfig } from 'axios';
import instance, { createAxiosInstanceWithToken } from './instance.axios';

export class BaseApi {
  private static getAxiosInstance(token?: string) {
    return token ? createAxiosInstanceWithToken(token) : instance;
  }

  public static async get(url: string, params?: Record<string, any>, token?: string): Promise<any> {
    try {
      const axiosInstance = this.getAxiosInstance(token);
      const result = await axiosInstance.get(url, {
        params,
        data: params
      });

      return result?.data ?? null;
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public static async post(url: string, params: Record<string, any>, config?: AxiosRequestConfig, token?: string): Promise<any> {
    try {
      const axiosInstance = this.getAxiosInstance(token);
      const result = await axiosInstance.post(url, params, config);
      return result?.data ?? null;
    } catch (error) {
      console.log(error);
      return await Promise.reject(error);
    }
  }

  public static async put(url: string, params: Record<string, any>, config?: AxiosRequestConfig, token?: string): Promise<any> {
    try {
      const axiosInstance = this.getAxiosInstance(token);
      const result = await axiosInstance.put(url, params, config);
      return result?.data ?? null;
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public static async delete(url: string, config?: AxiosRequestConfig, token?: string): Promise<any> {
    try {
      const axiosInstance = this.getAxiosInstance(token);
      const result = await axiosInstance.delete(url, config);
      return result?.data ?? null;
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public static async patch(url: string, params: Record<string, any>, config?: AxiosRequestConfig, token?: string): Promise<any> {
    try {
      const axiosInstance = this.getAxiosInstance(token);
      const result = await axiosInstance.patch(url, params, config);
      return result?.data ?? null;
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public static async postWithCancel(url: string, params: Record<string, any>, signal: any, token?: string): Promise<any> {
    try {
      const axiosInstance = this.getAxiosInstance(token);
      const result = await axiosInstance.post(url, params, {
        signal,
        headers: { 'Abort-Signal': signal.aborted ? 'aborted' : 'not-aborted' }
      });
      return result?.data ?? null;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
