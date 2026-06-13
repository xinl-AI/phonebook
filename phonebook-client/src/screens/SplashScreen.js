import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

/**
 * 启动页
 */
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={64} color={colors.primary} />
      <Text style={styles.appName}>手机通讯录</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  spinner: {
    marginTop: 32,
  },
});

export default SplashScreen;
