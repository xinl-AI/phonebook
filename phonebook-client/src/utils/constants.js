import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * 全局常量定义（Expo 版本）
 */

/**
 * 获取 API 基础地址
 * 自动适配：模拟器 → 10.0.2.2 / localhost
 *           真机 → 电脑局域网IP（从 Expo hostUri 提取）
 */
const getBaseUrl = () => {
  if (__DEV__) {
    // 尝试从 Expo dev server 地址推断 API 地址
    try {
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        // hostUri 格式: "192.168.x.x:8081" 或 "10.0.2.2:8081"
        const host = hostUri.split(':')[0];
        // Expo dev server 在 8081，API 在 8080
        return `http://${host}:8080`;
      }
    } catch (e) {
      // 降级方案
    }

    // 降级：根据平台猜测
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:8080'
      : 'http://localhost:8080';
  }
  // 生产环境
  return 'http://localhost:8080';
};

export const API_BASE_URL = getBaseUrl();

// AsyncStorage Key 前缀
export const STORAGE_KEYS = {
  TOKEN: '@phonebook_token',
  USER_INFO: '@phonebook_user_info',
};

// 分页默认参数
export const PAGE_SIZE = 20;
