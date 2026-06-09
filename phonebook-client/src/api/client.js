import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/storage';

/**
 * Axios实例 - 全局HTTP请求配置
 * - 请求拦截器：自动携带JWT Token
 * - 响应拦截器：401自动跳转登录页
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加Authorization头
client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：处理401和统一错误
client.interceptors.response.use(
  (response) => {
    return response.data; // 直接返回Result {code, message, data}
  },
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Token过期或无效 → 清除本地数据，触发登录跳转
        await removeToken();
        // 通过事件通知全局（导航组件监听此事件）
        if (global.onUnauthorized) {
          global.onUnauthorized();
        }
      }
    }
    // 返回错误数据
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { code: 500, message: '网络错误', data: null };
  },
);

export default client;
