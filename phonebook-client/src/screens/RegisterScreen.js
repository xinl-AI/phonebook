import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Keyboard, Platform, StyleSheet,
} from 'react-native';
import useAuthStore from '../stores/useAuthStore';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import { isValidUsername, isValidPassword, isValidEmail } from '../utils/validator';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toastProps, showToast } = useToast();
  const { register } = useAuthStore();
  const timerRef = useRef(null);

  // 清理定时器防止内存泄漏
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!isValidUsername(username)) { showToast('用户名长度需为3-50字符', 'error'); return; }
    if (!isValidPassword(password)) { showToast('密码长度至少6位', 'error'); return; }
    if (password !== confirmPassword) { showToast('两次密码输入不一致', 'error'); return; }
    if (email.trim() !== '' && !isValidEmail(email.trim())) { showToast('请输入正确的邮箱格式', 'error'); return; }

    setLoading(true);
    const result = await register({ username: username.trim(), password, phone: phone.trim(), email: email.trim() });
    setLoading(false);

    if (result.success) {
      showToast('注册成功，请登录');
      timerRef.current = setTimeout(() => navigation.goBack(), 1200);
    } else {
      showToast(result.message || '注册失败', 'error');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>用户名 *</Text>
            <TextInput style={styles.input} placeholder="请输入用户名（3-50字符）" placeholderTextColor={colors.textHint} value={username} onChangeText={setUsername} autoCapitalize="none" returnKeyType="next" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>密码 *</Text>
            <TextInput style={styles.input} placeholder="请输入密码（至少6位）" placeholderTextColor={colors.textHint} value={password} onChangeText={setPassword} secureTextEntry returnKeyType="next" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>确认密码 *</Text>
            <TextInput style={styles.input} placeholder="请再次输入密码" placeholderTextColor={colors.textHint} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry returnKeyType="next" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>手机号</Text>
            <TextInput style={styles.input} placeholder="请输入手机号（选填）" placeholderTextColor={colors.textHint} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>邮箱</Text>
            <TextInput style={styles.input} placeholder="请输入邮箱（选填，如 example@mail.com）" placeholderTextColor={colors.textHint} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <TouchableOpacity style={[styles.registerBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            <Text style={styles.registerBtnText}>{loading ? '注册中...' : '注 册'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomToast {...toastProps} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingVertical: spacing.xl },
  form: { paddingHorizontal: spacing.xl },
  field: { marginBottom: spacing.base },
  label: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.xs, marginLeft: 2 },
  input: { backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: spacing.base, height: 46, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  registerBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  registerBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});

export default RegisterScreen;
