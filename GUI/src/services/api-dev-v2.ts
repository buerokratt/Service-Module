import axios, { AxiosError } from 'axios';

let url = import.meta.env.REACT_APP_RUUTER_API_URL;
if(import.meta.env.REACT_APP_LOCAL === 'true') {
    url = '/generic'
}

const instance = axios.create({
    baseURL: url,
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
        // Add switch case to handle specific error codes
        if ((error.response?.status ?? 0) > 400 && (error.response?.status ?? 0) < 599) {
            console.log('Teenusele puudub ligipääs. Proovi hiljem uuesti.');
        }
    return Promise.reject(error);
  }
);

export default instance;
