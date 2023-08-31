import AxiosMockAdapter from 'axios-mock-adapter';
import axios, {AxiosError} from 'axios';

export const mockApi = axios.create({
    baseURL: '/mock',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
mockApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            //TODO: handle unauthorized requests
        }
        return Promise.reject(error);
    },
);

export const api = new AxiosMockAdapter(mockApi, {delayResponse: 0});
