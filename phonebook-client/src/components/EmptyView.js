import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 空状态视图
 */
const EmptyView = ({ message = '暂无数据', iconName = 'file-tray-outline' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={48} color={colors.textHint} />
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
  message: {
    fontSize: 15,
    color: colors.textHint,
    marginTop: spacing.md,
  },
});

export default EmptyView;
