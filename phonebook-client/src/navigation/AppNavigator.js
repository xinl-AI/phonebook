import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../stores/useAuthStore';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

/**
 * 根路由导航
 * 根据登录状态判断显示：
 * - Splash：检查登录状态
 * - Auth：未登录 → 显示登录/注册流程
 * - Main：已登录 → 显示主应用
 */
const AppNavigator = () => {
  const { isLoggedIn, isLoading, checkLoginStatus } = useAuthStore();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 监听全局401事件（Token过期）
  useEffect(() => {
    global.onUnauthorized = () => {
      useAuthStore.getState().logout();
    };
    return () => {
      global.onUnauthorized = null;
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
