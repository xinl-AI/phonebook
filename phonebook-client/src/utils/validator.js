/**
 * 表单验证工具
 */

/** 验证手机号 */
export const isValidPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/** 验证邮箱 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/** 验证密码（至少6位） */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/** 验证用户名（3-50字符） */
export const isValidUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};
