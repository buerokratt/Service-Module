import axios, {AxiosError} from 'axios';

const testCookie = 'bearer ' + (localStorage.getItem('token') ?? 'test');

const instance = axios.create({
    baseURL: import.meta.env.REACT_APP_RUUTER_API_URL + '/generic/',
    headers: {
        Accept: 'application/json',
        Testcookie: '',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    withCredentials: false,
});

instance.interceptors.request.use((config) => {
    config.headers['Testcookie'] = testCookie;
    return config;
});

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(new Error(error.message));
    },
);

export default instance;
