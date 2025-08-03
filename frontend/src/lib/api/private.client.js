import axios from 'axios';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import queryString from 'query-string';

const privateClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  paramsSerializer: params => queryString.stringify(params)
});

//attach tokens to every request
privateClient.interceptors.request.use(
  config => {
    config.headers = config.headers ?? {};
    const accessToken = localStorage.getItem('actkn');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  err => Promise.reject(err)
);

//on 401, try refresh → retry original request once
privateClient.interceptors.response.use(
  res => res,
  async error => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refreshToken = localStorage.getItem('reftkn');
        const { data } = await axios.post(
          `${PUBLIC_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );
        const { accessToken: newAT, refreshToken: newRT } = data;
        localStorage.setItem('actkn', newAT);
        localStorage.setItem('reftkn', newRT);
        orig.headers.Authorization = `Bearer ${newAT}`;
        return privateClient(orig);
      } catch (refreshErr) {
        localStorage.removeItem('actkn');
        localStorage.removeItem('reftkn');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default privateClient;