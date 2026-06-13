import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { contactAPI } from '../api/contacts';
import useContactStore from '../stores/useContactStore';
import EmptyView from '../components/EmptyView';
import CustomModal from '../components/CustomModal';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import LoadingView from '../components/LoadingView';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const RecycleBinScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ visible: false, contact: null });
  const { toastProps, showToast } = useToast();
  const { loadContacts } = useContactStore();

  const loadRecycleList = useCallback(async () => {
    try {
      const result = await contactAPI.getRecycleList({ page: 1, size: 100 });
      if (result?.code === 200) setContacts(result.data.records || []);
    } catch (e) { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadRecycleList(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadRecycleList());
    return unsubscribe;
  }, [navigation, loadRecycleList]);

  const handleRestore = async (contact) => {
    const result = await contactAPI.restore(contact.id);
    if (result?.code === 200) {
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      showToast(`「${contact.name}」已恢复`);
    } else {
      showToast(result?.message || '恢复失败', 'error');
    }
  };

  const handlePermanentDelete = (contact) => setDeleteModal({ visible: true, contact });

  const confirmPermanentDelete = async () => {
    const contact = deleteModal.contact;
    setDeleteModal({ visible: false, contact: null });
    if (!contact) return;
    const result = await contactAPI.permanentDelete(contact.id);
    if (result?.code === 200) {
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      showToast(`「${contact.name}」已永久删除`);
    } else {
      showToast(result?.message || '删除失败', 'error');
    }
  };

  const handleClearAll = () => {
    if (contacts.length === 0) return;
    Alert.alert('清空回收站', `确定要永久删除回收站中的 ${contacts.length} 个联系人吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '全部删除', style: 'destructive', onPress: async () => {
        setClearLoading(true);
        let count = 0;
        for (const c of contacts) {
          try {
            const result = await contactAPI.permanentDelete(c.id);
            if (result?.code === 200) count++;
          } catch (e) { /* continue */ }
        }
        setClearLoading(false);
        showToast(`已永久删除 ${count} 个联系人`);
        setContacts([]);
      }},
    ]);
  };

  const renderItem = useCallback(({ item }) => (
    <View style={styles.item}>
      <View style={styles.info}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.textInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.restoreBtn} onPress={() => handleRestore(item)} accessible accessibilityLabel={`恢复${item.name}`}>
          <Ionicons name="refresh-outline" size={16} color={colors.primary} />
          <Text style={styles.restoreText}> 恢复</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handlePermanentDelete(item)} accessible accessibilityLabel={`永久删除${item.name}`}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={styles.deleteText}> 删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), []);

  if (loading) return <LoadingView message="加载回收站..." />;

  return (
    <View style={styles.container}>
      {contacts.length > 0 && (
        <View style={styles.headerBar}>
          <Text style={styles.headerText}>共 {contacts.length} 个已删除的联系人</Text>
          <TouchableOpacity onPress={handleClearAll} disabled={clearLoading} accessible accessibilityLabel="清空回收站">
            <Text style={[styles.clearAllText, clearLoading && { opacity: 0.5 }]}>
              {clearLoading ? '清空中...' : '清空回收站'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={!loading && <EmptyView message="回收站为空" iconName="trash-outline" />}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadRecycleList().finally(() => setRefreshing(false)); }}
        contentContainerStyle={contacts.length === 0 ? { flex: 1 } : undefined}
      />

      <CustomModal visible={deleteModal.visible} title="永久删除" message={`确定要永久删除「${deleteModal.contact?.name}」吗？\n\n此操作不可恢复！`} confirmText="永久删除" cancelText="取消" danger onConfirm={confirmPermanentDelete} onCancel={() => setDeleteModal({ visible: false, contact: null })} />
      <CustomToast {...toastProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  headerText: { fontSize: 14, color: colors.textSecondary },
  clearAllText: { fontSize: 14, color: colors.error, fontWeight: '500' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.textHint, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  textInfo: { marginLeft: spacing.md, flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: colors.textPrimary, textDecorationLine: 'line-through' },
  phone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row' },
  restoreBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.primaryLight, borderRadius: 6, marginRight: spacing.sm },
  restoreText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.error + '15', borderRadius: 6 },
  deleteText: { fontSize: 13, color: colors.error, fontWeight: '500' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.base + 40 + spacing.md },
});

export default RecycleBinScreen;
