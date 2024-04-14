import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

const client = axios.create({
  baseURL: SITE_URL
});

export const request = async <T, R = undefined>(
  options: AxiosRequestConfig<R>
) => {
  try {
    const response = await client<T>(options);
    return response.data;
  } catch (error) {
    throw (error as AxiosError)?.response?.data;
  }
};
