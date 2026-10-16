import { relativeApiPath } from './requestRouting';
import { coordinateAuthenticatedRequests } from './authenticatedAdapter';
import axios, { AxiosError } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.REACT_APP_RUUTER_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  withCredentials: true,
});

instance.interceptors.request.use((request) => {
  request.url = relativeApiPath(request.baseURL || '', request.url || '');
  return request;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Add switch case to handle specific error codes
    if ((error.response?.status ?? 0) > 400 && (error.response?.status ?? 0) < 599) {
      console.log('Teenusele puudub ligipääs. Proovi hiljem uuesti.');
    }
    return Promise.reject(error);
  },
);

export default instance;

coordinateAuthenticatedRequests(instance);
