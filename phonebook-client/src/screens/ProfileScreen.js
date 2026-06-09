import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import client from '../api/client';
import { authAPI } from '../api/auth';
import useAuthStore from '../stores/useAuthStore';
import Avatar from '../components/Avatar';
import CustomToast from '../components/CustomToast';
import { isValidEmail } from '../utils/validator';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 个人中心页
 * 查看和编辑个人信息
 */
const ProfileScreen = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({
    nickname: '',
    phone: '',
    email: '',
    gender: 0,
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await authAPI.getCurrentUser();
    if (result.code === 200) {
      const u = result.data;
      setProfile({
        nickname: u.nickname || '',
        phone: u.phone || '',
        email: u.email || '',
        gender: u.gender || 0,
        avatar: u.avatar || '',
      });
    }
  };

  const handleSave = async () => {
    // 邮箱格式校验
    if (profile.email.trim() !== '' && !isValidEmail(profile.email.trim())) {
      setToast({ visible: true, message: '请输入正确的邮箱格式', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const updateResult = await client.put('/api/users/profile', {
        nickname: profile.nickname,
        phone: profile.phone,
        email: profile.email,
        gender: profile.gender,
      });
      if (updateResult.code === 200) {
        setToast({ visible: true, message: '保存成功', type: 'success' });
        // 刷新本地用户信息显示
        const userResult = await authAPI.getCurrentUser();
        if (userResult.code === 200) {
          const u = userResult.data;
          setProfile({
            nickname: u.nickname || '',
            phone: u.phone || '',
            email: u.email || '',
            gender: u.gender || 0,
            avatar: u.avatar || '',
          });
        }
      } else {
        setToast({ visible: true, message: updateResult.message || '保存失败', type: 'error' });
      }
    } catch (e) {
      setToast({ visible: true, message: '网络错误', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 头像区域 */}
        <View style={styles.avatarSection}>
          <Avatar name={profile.nickname || user?.username} uri={profile.avatar} size={72} />
          <Text style={styles.username}>@{user?.username || ''}</Text>
        </View>

        {/* 信息卡片 */}
        <View style={styles.card}>
          <FormRow label="昵称">
            <TextInput
              style={styles.input}
              value={profile.nickname}
              onChangeText={(v) => setProfile((p) => ({ ...p, nickname: v }))}
              placeholder="请输入昵称"
              placeholderTextColor={colors.textHint}
            />
          </FormRow>
          <FormRow label="手机号">
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(v) => setProfile((p) => ({ ...p, phone: v }))}
              placeholder="请输入手机号"
              placeholderTextColor={colors.textHint}
              keyboardType="phone-pad"
            />
          </FormRow>
          <FormRow label="邮箱">
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))}
              placeholder="请输入邮箱"
              placeholderTextColor={colors.textHint}
              keyboardType="email-address"
            />
          </FormRow>
          <FormRow label="性别">
            <View style={styles.genderRow}>
              {[
                { value: 0, label: '未知' },
                { value: 1, label: '男' },
                { value: 2, label: '女' },
              ].map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.genderBtn,
                    profile.gender === g.value && styles.genderBtnActive,
                  ]}
                  onPress={() => setProfile((p) => ({ ...p, gender: g.value }))}>
                  <Text
                    style={[
                      styles.genderText,
                      profile.gender === g.value && styles.genderTextActive,
                    ]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormRow>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>保存修改</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </View>
  );
};

const FormRow = ({ label, children }) => (
  <View style={styles.formRow}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowContent}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  username: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    marginTop: spacing.md,
    paddingHorizontal: spacing.base,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    width: 68,
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowContent: {
    flex: 1,
  },
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  genderRow: {
    flexDirection: 'row',
  },
  genderBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  genderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginTop: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
