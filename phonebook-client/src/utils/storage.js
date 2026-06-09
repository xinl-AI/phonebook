import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

/**
 * 本地存储工具 - 封装AsyncStorage操作
 */

/** 保存Token */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (e) {
    console.error('保存Token失败:', e);
  }
};

/** 获取Token */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (e) {
    console.error('获取Token失败:', e);
    return null;
  }
};

/** 删除Token */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (e) {
    console.error('删除Token失败:', e);
  }
};

/** 保存用户信息 */
export const saveUserInfo = async (userInfo) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  } catch (e) {
    console.error('保存用户信息失败:', e);
  }
};

/** 获取用户信息 */
export const getUserInfo = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('获取用户信息失败:', e);
    return null;
  }
};

/** 清除所有本地数据 */
export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER_INFO]);
  } catch (e) {
    console.error('清除数据失败:', e);
  }
};
