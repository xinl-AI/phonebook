import client from './client';

/**
 * 认证相关API
 */
export const authAPI = {
  /** 注册 */
  register: (data) => client.post('/api/auth/register', data),

  /** 登录 */
  login: (data) => client.post('/api/auth/login', data),

  /** 退出登录 */
  logout: () => client.post('/api/auth/logout'),

  /** 获取当前用户信息 */
  getCurrentUser: () => client.get('/api/auth/me'),

  /** 修改密码 */
  changePassword: (data) => client.put('/api/auth/password', data),
};
