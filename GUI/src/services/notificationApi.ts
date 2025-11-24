import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const defaultConfig = {
  baseURL: import.meta.env.REACT_APP_NOTIFICATION_NODE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  withCredentials: false,
};

const instance = axios.create(defaultConfig);

export const createApiInstance = (additionalHeaders?: Record<string, string>) => {
  const config: AxiosRequestConfig = {
    ...defaultConfig,
    headers: {
      ...defaultConfig.headers,
      ...additionalHeaders,
    },
  };

  return axios.create(config);
};

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(new Error(error.message));
  },
);

export default instance;
