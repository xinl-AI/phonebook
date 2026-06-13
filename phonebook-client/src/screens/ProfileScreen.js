import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import client from '../api/client';
import { authAPI } from '../api/auth';
import useAuthStore from '../stores/useAuthStore';
import Avatar from '../components/Avatar';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import LoadingView from '../components/LoadingView';
import { isValidEmail } from '../utils/validator';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const ProfileScreen = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({ nickname: '', phone: '', email: '', gender: 0, avatar: '' });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toastProps, showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const result = await authAPI.getCurrentUser();
        if (result?.code === 200) {
          const u = result.data;
          setProfile({ nickname: u.nickname || '', phone: u.phone || '', email: u.email || '', gender: u.gender || 0, avatar: u.avatar || '' });
        }
      } catch (e) { showToast('加载个人信息失败', 'error'); }
      setDataLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    Keyboard.dismiss();
    if (profile.email.trim() !== '' && !isValidEmail(profile.email.trim())) { showToast('请输入正确的邮箱格式', 'error'); return; }

    setLoading(true);
    try {
      const updateResult = await client.put('/api/users/profile', { nickname: profile.nickname, phone: profile.phone, email: profile.email, gender: profile.gender });
      if (updateResult?.code === 200) {
        showToast('保存成功');
        const userResult = await authAPI.getCurrentUser();
        if (userResult?.code === 200) {
          const u = userResult.data;
          setProfile({ nickname: u.nickname || '', phone: u.phone || '', email: u.email || '', gender: u.gender || 0, avatar: u.avatar || '' });
        }
      } else {
        showToast(updateResult?.message || '保存失败', 'error');
      }
    } catch (e) { showToast('网络错误', 'error'); }
    setLoading(false);
  };

  if (dataLoading) return <LoadingView message="加载个人信息..." />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Avatar name={profile.nickname || user?.username} uri={profile.avatar} size={72} />
          <Text style={styles.username}>@{user?.username || ''}</Text>
        </View>

        <View style={styles.card}>
          <FormRow label="昵称">
            <TextInput style={styles.input} value={profile.nickname} onChangeText={(v) => setProfile((p) => ({ ...p, nickname: v }))} placeholder="请输入昵称" placeholderTextColor={colors.textHint} />
          </FormRow>
          <FormRow label="手机号">
            <TextInput style={styles.input} value={profile.phone} onChangeText={(v) => setProfile((p) => ({ ...p, phone: v }))} placeholder="请输入手机号" placeholderTextColor={colors.textHint} keyboardType="phone-pad" />
          </FormRow>
          <FormRow label="邮箱">
            <TextInput style={styles.input} value={profile.email} onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))} placeholder="请输入邮箱" placeholderTextColor={colors.textHint} keyboardType="email-address" autoCapitalize="none" />
          </FormRow>
          <FormRow label="性别">
            <View style={styles.genderRow}>
              {[{ value: 0, label: '未知' }, { value: 1, label: '男' }, { value: 2, label: '女' }].map((g) => (
                <TouchableOpacity key={g.value} style={[styles.genderBtn, profile.gender === g.value && styles.genderBtnActive]} onPress={() => setProfile((p) => ({ ...p, gender: g.value }))}>
                  <Text style={[styles.genderText, profile.gender === g.value && styles.genderTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormRow>
        </View>

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{loading ? '保存中...' : '保存修改'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomToast {...toastProps} />
    </View>
  );
};

const FormRow = ({ label, children }) => (
  <View style={styles.formRow}><Text style={styles.rowLabel}>{label}</Text><View style={styles.rowContent}>{children}</View></View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.surface },
  username: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, marginTop: spacing.md, paddingHorizontal: spacing.base },
  formRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowLabel: { width: 68, fontSize: 14, color: colors.textSecondary },
  rowContent: { flex: 1 },
  input: { fontSize: 15, color: colors.textPrimary, padding: 0 },
  genderRow: { flexDirection: 'row' },
  genderBtn: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  genderBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { fontSize: 13, color: colors.textSecondary },
  genderTextActive: { color: '#FFFFFF', fontWeight: '500' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginHorizontal: spacing.base, marginTop: spacing.xl, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
