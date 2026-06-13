import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, Alert, StyleSheet } from 'react-native';
import { authAPI } from '../api/auth';
import useAuthStore from '../stores/useAuthStore';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const SettingsScreen = () => {
  const { logout } = useAuthStore();
  const { toastProps, showToast } = useToast();

  const [pwdModal, setPwdModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleChangePassword = () => {
    setOldPassword(''); setNewPassword(''); setConfirmNew('');
    setPwdModal(true);
  };

  const submitPassword = async () => {
    Keyboard.dismiss();
    if (!oldPassword) { showToast('请输入原密码', 'error'); return; }
    if (!newPassword || newPassword.length < 6) { showToast('新密码至少6位', 'error'); return; }
    if (newPassword !== confirmNew) { showToast('两次密码输入不一致', 'error'); return; }

    setPwdLoading(true);
    const result = await authAPI.changePassword({ oldPassword, newPassword });
    setPwdLoading(false);

    if (result?.code === 200) {
      setPwdModal(false);
      Alert.alert('提示', '密码修改成功，请重新登录', [{ text: '确定', onPress: () => logout() }]);
    } else {
      showToast(result?.message || '修改失败', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <SettingsItem label="修改密码" onPress={handleChangePassword} />
          <SettingsItem label="清除缓存" onPress={() => Alert.alert('提示', '缓存已清除')} />
          <SettingsItem label="关于我们" onPress={() => Alert.alert('关于', '手机通讯录 v1.0.0\n基于 React Native (Expo) 开发')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('确认退出', '确定要退出登录吗？', [{ text: '取消', style: 'cancel' }, { text: '确定', onPress: logout }])} activeOpacity={0.7}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <Text style={styles.version}>手机通讯录 v1.0.0</Text>
      </ScrollView>

      {pwdModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改密码</Text>
            <TextInput style={styles.modalInput} value={oldPassword} onChangeText={setOldPassword} placeholder="请输入原密码" placeholderTextColor={colors.textHint} secureTextEntry />
            <TextInput style={styles.modalInput} value={newPassword} onChangeText={setNewPassword} placeholder="请输入新密码（至少6位）" placeholderTextColor={colors.textHint} secureTextEntry />
            <TextInput style={styles.modalInput} value={confirmNew} onChangeText={setConfirmNew} placeholder="请确认新密码" placeholderTextColor={colors.textHint} secureTextEntry />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setPwdModal(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalConfirmBtn, pwdLoading && { opacity: 0.7 }]} onPress={submitPassword} disabled={pwdLoading}>
                <Text style={styles.modalConfirmText}>{pwdLoading ? '提交中...' : '确认修改'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <CustomToast {...toastProps} />
    </View>
  );
};

const SettingsItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.6}>
    <Text style={styles.itemLabel}>{label}</Text>
    <Text style={styles.itemArrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingTop: spacing.md },
  section: { backgroundColor: colors.surface, marginBottom: spacing.lg },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md + 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  itemLabel: { fontSize: 16, color: colors.textPrimary },
  itemArrow: { fontSize: 20, color: colors.textHint },
  logoutBtn: { backgroundColor: colors.surface, borderRadius: 12, marginHorizontal: spacing.base, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 13, color: colors.textHint, marginTop: spacing.xl },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { width: '85%', backgroundColor: colors.surface, borderRadius: 14, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  modalInput: { backgroundColor: colors.surfaceSecondary, borderRadius: 8, paddingHorizontal: spacing.md, height: 44, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  modalButtons: { flexDirection: 'row', marginTop: spacing.sm },
  modalBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: 8, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: colors.surfaceSecondary, marginRight: spacing.sm },
  modalConfirmBtn: { backgroundColor: colors.primary },
  modalCancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  modalConfirmText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
});

export default SettingsScreen;
