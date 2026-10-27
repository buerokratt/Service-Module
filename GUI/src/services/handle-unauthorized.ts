import { AxiosError } from 'axios';

export const redirectToLoginIfUnauthorized = (error: AxiosError) => {
  console.log(error);
};
