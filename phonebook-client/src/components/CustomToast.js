import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

/**
 * 轻提示组件
 * 显示后自动消失的提示信息
 * @param {boolean} visible - 是否显示
 * @param {string} message - 提示文字
 * @param {string} type - 类型：success/error/info
 * @param {number} duration - 显示时长（毫秒）
 * @param {function} onHide - 隐藏回调
 */
const CustomToast = ({ visible, message, type = 'success', duration = 2000, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor =
    type === 'success' ? colors.success :
    type === 'error' ? colors.error : colors.textPrimary;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bgColor }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default CustomToast;
