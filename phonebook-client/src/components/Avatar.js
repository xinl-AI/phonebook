import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../styles/colors';

/**
 * 头像组件
 * 显示用户/联系人头像或首字母占位图
 * @param {string} uri - 头像图片URL（可选）
 * @param {string} name - 姓名（用于生成首字母）
 * @param {number} size - 头像尺寸（默认48）
 * @param {string} color - 背景色（无图片时使用）
 */
const Avatar = ({ uri, name = '', size = 48, color }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const bgColor = color || colors.primary;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Avatar;
