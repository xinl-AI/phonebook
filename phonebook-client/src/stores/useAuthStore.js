import { create } from 'zustand';
import { authAPI } from '../api/auth';
import { saveToken, removeToken, saveUserInfo, clearAll } from '../utils/storage';

/**
 * 认证状态管理 (Zustand)
 */
const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true,

  checkLoginStatus: async () => {
    try {
      const result = await authAPI.getCurrentUser();
      if (result?.code === 200) {
        set({ isLoggedIn: true, user: result.data, isLoading: false });
        return true;
      }
    } catch (e) { /* Token 无效 */ }
    set({ isLoggedIn: false, user: null, isLoading: false });
    return false;
  },

  login: async (username, password) => {
    try {
      const result = await authAPI.login({ username, password });
      if (result?.code === 200) {
        const { token, userId, username: name, nickname, avatar } = result.data;
        await saveToken(token);
        const userInfo = { id: userId, username: name, nickname, avatar };
        await saveUserInfo(userInfo);
        set({ isLoggedIn: true, user: userInfo });
        return { success: true };
      }
      return { success: false, message: result?.message || '登录失败' };
    } catch (e) {
      return { success: false, message: '网络错误，请检查连接' };
    }
  },

  register: async (data) => {
    try {
      const result = await authAPI.register(data);
      if (result?.code === 200) {
        return { success: true };
      }
      return { success: false, message: result?.message || '注册失败' };
    } catch (e) {
      return { success: false, message: '网络错误，请检查连接' };
    }
  },

  logout: async () => {
    try { await authAPI.logout(); } catch (e) { /* ignore */ }
    await clearAll();
    set({ isLoggedIn: false, user: null });
  },
}));

export default useAuthStore;
