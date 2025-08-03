import axios from 'axios';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import queryString from 'query-string';

export const publicClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  paramsSerializer: params => queryString.stringify(params)
});