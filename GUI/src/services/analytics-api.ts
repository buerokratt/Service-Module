import axios, { AxiosError } from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.REACT_APP_RUUTER_V2_ANALYTICS_API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export default instance;
