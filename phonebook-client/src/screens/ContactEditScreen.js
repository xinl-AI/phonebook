import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { contactAPI } from '../api/contacts';
import useGroupStore from '../stores/useGroupStore';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import LoadingView from '../components/LoadingView';
import { isValidPhone, isValidEmail } from '../utils/validator';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const ContactEditScreen = ({ route, navigation }) => {
  const { mode, contactId } = route.params || {};
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name: '', phone: '', secondPhone: '', email: '', secondEmail: '',
    address: '', birthday: '', company: '', position: '', website: '',
    remark: '', avatar: '', groupIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(isEdit);
  const { toastProps, showToast } = useToast();
  const { groups, loadGroups } = useGroupStore();
  const timerRef = useRef(null);

  useEffect(() => { loadGroups(); }, []);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (isEdit && contactId) {
      setDataLoading(true);
      (async () => {
        try {
          const result = await contactAPI.getDetail(contactId);
          if (result?.code === 200) {
            const c = result.data;
            setForm({
              name: c.name || '', phone: c.phone || '', secondPhone: c.secondPhone || '',
              email: c.email || '', secondEmail: c.secondEmail || '', address: c.address || '',
              birthday: c.birthday || '', company: c.company || '', position: c.position || '',
              website: c.website || '', remark: c.remark || '', avatar: c.avatar || '',
              groupIds: c.groups ? c.groups.map((g) => g.id) : [],
            });
          }
        } catch (e) { showToast('加载联系人数据失败', 'error'); }
        setDataLoading(false);
      })();
    }
  }, [contactId]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleGroup = (groupId) => setForm((prev) => {
    const ids = [...prev.groupIds];
    ids.includes(groupId) ? ids.splice(ids.indexOf(groupId), 1) : ids.push(groupId);
    return { ...prev, groupIds: ids };
  });

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!form.name.trim()) { showToast('请输入联系人姓名', 'error'); return; }
    if (!form.phone.trim()) { showToast('请输入电话号码', 'error'); return; }
    if (!isValidPhone(form.phone.trim())) { showToast('请输入正确的手机号码', 'error'); return; }
    if (form.email.trim() !== '' && !isValidEmail(form.email.trim())) { showToast('请输入正确的邮箱格式', 'error'); return; }
    if (form.secondEmail.trim() !== '' && !isValidEmail(form.secondEmail.trim())) { showToast('备用邮箱格式不正确', 'error'); return; }

    setLoading(true);
    const data = { ...form, name: form.name.trim(), phone: form.phone.trim() };
    const result = isEdit ? await contactAPI.update(contactId, data) : await contactAPI.add(data);
    setLoading(false);

    if (result?.code === 200) {
      showToast(isEdit ? '修改成功' : '添加成功');
      timerRef.current = setTimeout(() => navigation.goBack(), 800);
    } else {
      showToast(result?.message || '操作失败', 'error');
    }
  };

  if (dataLoading) return <LoadingView message="加载联系人信息..." />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <FormSection title="基本信息">
          <FormInput label="姓名 *" value={form.name} onChangeText={(v) => updateField('name', v)} placeholder="请输入姓名" />
          <FormInput label="手机号 *" value={form.phone} onChangeText={(v) => updateField('phone', v)} placeholder="请输入手机号" keyboardType="phone-pad" />
          <FormInput label="备用电话" value={form.secondPhone} onChangeText={(v) => updateField('secondPhone', v)} placeholder="请输入备用电话" keyboardType="phone-pad" />
          <FormInput label="邮箱" value={form.email} onChangeText={(v) => updateField('email', v)} placeholder="请输入邮箱" keyboardType="email-address" autoCapitalize="none" />
          <FormInput label="备用邮箱" value={form.secondEmail} onChangeText={(v) => updateField('secondEmail', v)} placeholder="请输入备用邮箱" keyboardType="email-address" autoCapitalize="none" />
        </FormSection>

        <FormSection title="其他信息（选填）">
          <FormInput label="地址" value={form.address} onChangeText={(v) => updateField('address', v)} placeholder="请输入地址" />
          <FormInput label="生日" value={form.birthday} onChangeText={(v) => updateField('birthday', v)} placeholder="yyyy-MM-dd" />
          <FormInput label="公司" value={form.company} onChangeText={(v) => updateField('company', v)} placeholder="请输入公司名称" />
          <FormInput label="职位" value={form.position} onChangeText={(v) => updateField('position', v)} placeholder="请输入职位" />
          <FormInput label="网站" value={form.website} onChangeText={(v) => updateField('website', v)} placeholder="请输入个人网站" />
          <FormInput label="备注" value={form.remark} onChangeText={(v) => updateField('remark', v)} placeholder="请输入备注" multiline />
        </FormSection>

        <FormSection title="所属分组">
          <View style={styles.groupGrid}>
            {groups.map((group) => (
              <TouchableOpacity key={group.id} style={[styles.groupChip, { borderColor: group.color || colors.primary }, form.groupIds.includes(group.id) && { backgroundColor: group.color || colors.primary }]} onPress={() => toggleGroup(group.id)}>
                <Text style={[styles.groupChipText, { color: form.groupIds.includes(group.id) ? '#FFFFFF' : (group.color || colors.textSecondary) }]}>{group.name}</Text>
              </TouchableOpacity>
            ))}
            {groups.length === 0 && <Text style={styles.noGroupText}>暂无分组</Text>}
          </View>
        </FormSection>

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{loading ? '保存中...' : isEdit ? '保存修改' : '添加联系人'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomToast {...toastProps} />
    </View>
  );
};

const FormSection = ({ title, children }) => (
  <View style={ss.section}><Text style={ss.sectionTitle}>{title}</Text>{children}</View>
);
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType, multiline, autoCapitalize }) => (
  <View style={ss.fieldContainer}>
    <Text style={ss.fieldLabel}>{label}</Text>
    <TextInput style={[ss.fieldInput, multiline && ss.multilineInput]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textHint} keyboardType={keyboardType} multiline={multiline} autoCapitalize={autoCapitalize || 'none'} />
  </View>
);

const ss = StyleSheet.create({
  section: { backgroundColor: colors.surface, marginTop: spacing.md, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  fieldContainer: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  fieldInput: { backgroundColor: colors.surfaceSecondary, borderRadius: 8, paddingHorizontal: spacing.md, height: 42, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  multilineInput: { height: 80, textAlignVertical: 'top', paddingTop: spacing.sm },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  groupChip: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs + 2, borderRadius: 16, borderWidth: 1, marginRight: spacing.sm, marginBottom: spacing.sm },
  groupChipText: { fontSize: 13, fontWeight: '500' },
  noGroupText: { fontSize: 13, color: colors.textHint },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginHorizontal: spacing.base, marginTop: spacing.xl, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});

export default ContactEditScreen;
