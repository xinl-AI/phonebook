import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/storage';

/**
 * Axios 实例 (Expo)
 * - 请求拦截器：自动携带 JWT Token
 * - 响应拦截器：401 自动跳转登录（防并发）
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let isLoggingOut = false; // 防止 401 并发触发多次登出

client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      await removeToken();
      if (global.onUnauthorized) global.onUnauthorized();
      // 延迟重置防并发标志，等待页面跳转完成
      setTimeout(() => { isLoggingOut = false; }, 1000);
    }
    // 网络错误 vs 服务端错误
    if (!error.response) {
      return { code: 500, message: '网络连接失败，请检查网络', data: null };
    }
    return error.response?.data || { code: 500, message: '服务器错误', data: null };
  },
);

export default client;
