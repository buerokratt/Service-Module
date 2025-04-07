import axios, { AxiosError } from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.REACT_APP_RUUTER_V2_SERVICE_API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    withCredentials: true,
});

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(new Error(error.message));
    }
);

export default instance;
