import AxiosMockAdapter from 'axios-mock-adapter';
import axios, {AxiosError} from 'axios';

export const mockApi = axios.create({
    baseURL: '/mock',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    withCredentials: true,
});
mockApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(new Error(error.message));
    },
);

export const api = new AxiosMockAdapter(mockApi, {delayResponse: 0});
