import { create } from 'zustand';
import { authAPI } from '../api/auth';
import { saveToken, removeToken, saveUserInfo, clearAll } from '../utils/storage';

/**
 * 认证状态管理 (Zustand)
 *
 * 状态：
 * - isLoggedIn: 是否已登录
 * - user: 当前用户信息
 * - isLoading: 是否正在加载（启动时检查Token）
 *
 * 操作：
 * - checkLoginStatus: 启动时检查本地Token有效性
 * - login: 登录并保存Token
 * - register: 注册（不自动登录）
 * - logout: 退出登录并清除数据
 */
const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true,

  /** 检查登录状态（应用启动时调用） */
  checkLoginStatus: async () => {
    try {
      const result = await authAPI.getCurrentUser();
      if (result.code === 200) {
        set({ isLoggedIn: true, user: result.data, isLoading: false });
        return true;
      }
    } catch (e) {
      // Token无效，不做处理
    }
    set({ isLoggedIn: false, user: null, isLoading: false });
    return false;
  },

  /** 登录 */
  login: async (username, password) => {
    const result = await authAPI.login({ username, password });
    if (result.code === 200) {
      const { token, userId, username: name, nickname, avatar } = result.data;
      // 保存Token和用户信息
      await saveToken(token);
      const userInfo = { id: userId, username: name, nickname, avatar };
      await saveUserInfo(userInfo);
      set({ isLoggedIn: true, user: userInfo });
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  /** 注册 */
  register: async (data) => {
    const result = await authAPI.register(data);
    if (result.code === 200) {
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  /** 退出登录 */
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // 忽略网络错误
    }
    await clearAll();
    set({ isLoggedIn: false, user: null });
  },
}));

export default useAuthStore;
