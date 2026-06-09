import { Linking, Alert, Platform } from 'react-native';

/**
 * 电话与短信工具 (Expo 兼容)
 * 通过 Linking API 调用系统拨号器和短信应用
 */

/** 拨打电话 */
export const makeCall = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    Alert.alert('提示', '电话号码为空');
    return;
  }
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const url = Platform.OS === 'android'
    ? `tel:${cleanPhone}`
    : `telprompt:${cleanPhone}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('提示', '设备不支持拨号功能');
      }
    })
    .catch(() => Alert.alert('提示', '拨号失败'));
};

/** 发送短信 */
export const sendSMS = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    Alert.alert('提示', '电话号码为空');
    return;
  }
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const url = Platform.OS === 'android'
    ? `sms:${cleanPhone}`
    : `sms:${cleanPhone}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('提示', '设备不支持短信功能');
      }
    })
    .catch(() => Alert.alert('提示', '打开短信失败'));
};

/** 发送邮件 */
export const sendEmail = (email) => {
  if (!email || email.trim() === '') {
    Alert.alert('提示', '邮箱地址为空');
    return;
  }
  const url = `mailto:${email.trim()}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('提示', '设备不支持邮件功能');
      }
    })
    .catch(() => Alert.alert('提示', '打开邮件失败'));
};
