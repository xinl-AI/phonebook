import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../styles/colors';

/**
 * 启动页
 * 应用启动时显示，检查登录状态
 */
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>📇 手机通讯录</Text>
      <Text style={styles.subtitle}>您的私人通讯管家</Text>
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  spinner: {
    marginTop: 40,
  },
});

export default SplashScreen;
