import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ContactDetailScreen from '../screens/ContactDetailScreen';
import ContactEditScreen from '../screens/ContactEditScreen';
import GroupManageScreen from '../screens/GroupManageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

/**
 * 主应用路由（需登录后访问）
 */
const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1A1A2E',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        headerBackTitle: '返回',
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactDetail"
        component={ContactDetailScreen}
        options={{ title: '联系人详情' }}
      />
      <Stack.Screen
        name="ContactEdit"
        component={ContactEditScreen}
        options={{ title: '编辑联系人' }}
      />
      <Stack.Screen
        name="GroupManage"
        component={GroupManageScreen}
        options={{ title: '分组管理' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '个人中心' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
