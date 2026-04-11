import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/',
  timeout: 3000,
});

api.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  async function onRejected(error) {
    const config = error.config || {};

    config.retryCount = config.retryCount || 0;

    const shouldRetry =
      !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (!shouldRetry || config.retryCount >= 3) {
      return Promise.reject(error);
    }

    config.retryCount += 1;
    const delay = 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    return api(config);
  }
);
