import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { SESSION_TOKEN } from '../constants/local-storage.key';

const showToast = async (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const { ToasterService, TOAST_STATE } = await import('@/sharedComponents/toaster/toaster.service');
    const toastState = type === 'error' ? TOAST_STATE.danger : TOAST_STATE[type];
    ToasterService.showToast(toastState, message);
  } catch (error) {
    console.error('Error showing toast:', error);
  }
};


// Create a base axios instance
const createAxiosInstance = (baseConfig?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    ...baseConfig
  });

  instance.interceptors.request.use(
    (request) => {
      let token = '';
      
      // First, check if token is passed in config
      if (request.headers?.Authorization) {
        return request;
      }
      
      // For client-side, try sessionStorage
      if (typeof window !== 'undefined') {
        try {
          token = sessionStorage.getItem(SESSION_TOKEN) || '';
        } catch (error) {
          console.warn('Could not access sessionStorage:', error);
        }
      }
      
      // If we have a token, add it to headers
      if (token) {
        request.headers.Authorization = 'Bearer ' + token;
      }
      
      return request;
    },
    async (error) => {
      await Promise.reject(error);
    }
  );

  return instance;
};

// Create the default instance
const instance: AxiosInstance = createAxiosInstance();

// Function to create an instance with a specific token (for server-side use)
export const createAxiosInstanceWithToken = (token: string): AxiosInstance => {
  return createAxiosInstance({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

instance.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    console.log(error);
    if (error?.response?.status === 401) {
      await showToast('error', error?.response?.data?.message || 'Unauthorized');
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } else if (error?.response?.status === 403) {
      await showToast('error', error?.response?.data?.message || 'Forbidden');
    } else if (error?.response?.status === 404) {
      await showToast('error', error?.response?.data?.message || 'Data not found');
    } else if (error?.response?.status === 500) {
      await showToast('error', 'Something went wrong');
    }
    return await Promise.reject(error);
  }
);

export default instance;
