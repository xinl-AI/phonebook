import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Keyboard, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../stores/useAuthStore';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toastProps, showToast } = useToast();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username.trim()) { showToast('请输入用户名', 'error'); return; }
    if (!password.trim()) { showToast('请输入密码', 'error'); return; }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.success) showToast(result.message || '登录失败', 'error');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <Ionicons name="person-circle-outline" size={64} color={colors.primary} />
          <Text style={styles.appName}>手机通讯录</Text>
          <Text style={styles.appDesc}>安全、便捷的联系人管理</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={colors.textHint} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入用户名"
              placeholderTextColor={colors.textHint}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textHint} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              placeholderTextColor={colors.textHint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.loginBtnText}>{loading ? '登录中...' : '登 录'}</Text>
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

      <CustomToast {...toastProps} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  logoArea: { alignItems: 'center', marginBottom: spacing.xxl + spacing.base },
  appName: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  appDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  form: {},
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: spacing.base, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, height: 48, fontSize: 15, color: colors.textPrimary },
  loginBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  registerLink: { alignItems: 'center', marginTop: spacing.lg },
  registerText: { fontSize: 14, color: colors.textSecondary },
  registerHighlight: { color: colors.primary, fontWeight: '500' },
});

export default LoginScreen;
