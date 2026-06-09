import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 空状态视图
 * 列表为空时显示的占位组件
 * @param {string} message - 提示文字
 * @param {string} icon - 图标（emoji）
 */
const EmptyView = ({ message = '暂无数据', icon = '📭' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 15,
    color: colors.textHint,
  },
});

export default EmptyView;
