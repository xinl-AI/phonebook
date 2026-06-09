import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import useAuthStore from '../stores/useAuthStore';
import CustomToast from '../components/CustomToast';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 登录页
 * 用户名密码登录，登录成功后自动跳转主页
 */
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const { login } = useAuthStore();

  const handleLogin = async () => {
    // 表单校验
    if (!username.trim()) {
      setToast({ visible: true, message: '请输入用户名', type: 'error' });
      return;
    }
    if (!password.trim()) {
      setToast({ visible: true, message: '请输入密码', type: 'error' });
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      setToast({ visible: true, message: result.message || '登录失败', type: 'error' });
    }
    // 登录成功 → AppNavigator自动切换路由
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={styles.content}>
        {/* Logo区域 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoIcon}>📇</Text>
          <Text style={styles.appName}>手机通讯录</Text>
          <Text style={styles.appDesc}>安全、便捷的联系人管理</Text>
        </View>

        {/* 表单区域 */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入用户名"
              placeholderTextColor={colors.textHint}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              placeholderTextColor={colors.textHint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.loginBtnText}>
              {loading ? '登录中...' : '登 录'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              还没有账号？<Text style={styles.registerHighlight}>立即注册</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.xxl + spacing.base,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    // 白色卡片效果
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: colors.textPrimary,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerHighlight: {
    color: colors.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
