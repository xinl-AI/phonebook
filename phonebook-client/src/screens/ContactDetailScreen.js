import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { contactAPI } from '../api/contacts';
import { makeCall, sendSMS, sendEmail } from '../utils/phone';
import { formatDate } from '../utils/date';
import Avatar from '../components/Avatar';
import LoadingView from '../components/LoadingView';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const ContactDetailScreen = ({ route, navigation }) => {
  const { contactId } = route.params;
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toastProps, showToast } = useToast();
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const loadContact = async () => {
    try {
      const result = await contactAPI.getDetail(contactId);
      if (!mountedRef.current) return;
      if (result?.code === 200) { setContact(result.data); setError(false); }
      else { setError(true); }
    } catch (e) { if (mountedRef.current) { showToast('加载失败', 'error'); setError(true); } }
    if (mountedRef.current) setLoading(false);
  };

  useEffect(() => { loadContact(); }, [contactId]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadContact());
    return unsubscribe;
  }, [navigation, contactId]);

  if (loading) return <LoadingView />;
  if (error || !contact) return <View style={styles.container}><Text style={styles.errorText}>联系人不存在</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Avatar name={contact.name} uri={contact.avatar} size={72} />
          <Text style={styles.name}>{contact.name}</Text>
          {contact.company && <Text style={styles.company}>{contact.company}{contact.position ? ` · ${contact.position}` : ''}</Text>}
          {contact.isFavorite === 1 && <View style={styles.favoriteBadge}><Text style={styles.favoriteText}>★ 已收藏</Text></View>}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => makeCall(contact.phone)} accessible accessibilityLabel="拨打电话">
            <Ionicons name="call-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>拨号</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => sendSMS(contact.phone)} accessible accessibilityLabel="发送短信">
            <Ionicons name="chatbubble-outline" size={22} color={colors.info} />
            <Text style={styles.actionLabel}>短信</Text>
          </TouchableOpacity>
          {contact.email && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => sendEmail(contact.email)} accessible accessibilityLabel="发送邮件">
              <Ionicons name="mail-outline" size={22} color={colors.warning} />
              <Text style={styles.actionLabel}>邮件</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ContactEdit', { mode: 'edit', contactId: contact.id })} accessible accessibilityLabel="编辑联系人">
            <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.actionLabel}>编辑</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>联系信息</Text>
          <InfoRow label="手机" value={contact.phone} />
          {contact.secondPhone ? <InfoRow label="备用电话" value={contact.secondPhone} /> : null}
          {contact.email ? <InfoRow label="邮箱" value={contact.email} /> : null}
          {contact.secondEmail ? <InfoRow label="备用邮箱" value={contact.secondEmail} /> : null}
          {contact.address ? <InfoRow label="地址" value={contact.address} /> : null}
          {contact.website ? <InfoRow label="网站" value={contact.website} /> : null}
        </View>

        {(contact.birthday || contact.company || contact.remark) ? (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>其他信息</Text>
            {contact.birthday ? <InfoRow label="生日" value={formatDate(contact.birthday)} /> : null}
            {contact.company ? <InfoRow label="公司" value={contact.company} /> : null}
            {contact.position ? <InfoRow label="职位" value={contact.position} /> : null}
            {contact.remark ? <InfoRow label="备注" value={contact.remark} /> : null}
          </View>
        ) : null}

        {contact.groups && contact.groups.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>所属分组</Text>
            <View style={styles.groupRow}>
              {contact.groups.map((g) => (
                <View key={g.id} style={[styles.groupTag, { backgroundColor: g.color + '20' }]} accessible accessibilityLabel={`分组: ${g.name}`}>
                  <Text style={[styles.groupTagText, { color: g.color }]}>{g.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <CustomToast {...toastProps} />
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue} selectable>{value}</Text></View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  profileSection: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.surface },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md },
  company: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  favoriteBadge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 2, backgroundColor: colors.warning + '20', borderRadius: 10 },
  favoriteText: { fontSize: 12, color: colors.warning, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surface, paddingVertical: spacing.base, marginTop: spacing.sm },
  actionBtn: { alignItems: 'center', paddingHorizontal: spacing.lg },
  actionLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  infoCard: { backgroundColor: colors.surface, borderRadius: 12, marginHorizontal: spacing.base, marginTop: spacing.md, padding: spacing.base },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  infoLabel: { width: 80, fontSize: 14, color: colors.textSecondary },
  infoValue: { flex: 1, fontSize: 14, color: colors.textPrimary },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap' },
  groupTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: spacing.sm, marginBottom: spacing.xs },
  groupTagText: { fontSize: 13, fontWeight: '500' },
  errorText: { textAlign: 'center', marginTop: 100, fontSize: 16, color: colors.textSecondary },
});

export default ContactDetailScreen;
