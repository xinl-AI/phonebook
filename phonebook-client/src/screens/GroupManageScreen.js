import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, KeyboardAvoidingView, Keyboard, Platform, StyleSheet, Alert } from 'react-native';
import useGroupStore from '../stores/useGroupStore';
import useToast from '../hooks/useToast';
import CustomToast from '../components/CustomToast';
import EmptyView from '../components/EmptyView';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const GroupManageScreen = () => {
  const { groups, loadGroups, createGroup, updateGroup, deleteGroup } = useGroupStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#07C160');
  const { toastProps, showToast } = useToast();

  useEffect(() => { loadGroups(); }, []);

  const handleAdd = () => { setEditGroup(null); setGroupName(''); setGroupColor('#07C160'); setModalVisible(true); };

  const handleEdit = (group) => { setEditGroup(group); setGroupName(group.name); setGroupColor(group.color || '#07C160'); setModalVisible(true); };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!groupName.trim()) { showToast('请输入分组名称', 'error'); return; }
    const result = editGroup
      ? await updateGroup(editGroup.id, { name: groupName.trim(), color: groupColor })
      : await createGroup({ name: groupName.trim(), color: groupColor });
    if (result.success) { setModalVisible(false); showToast(editGroup ? '修改成功' : '创建成功'); }
    else { showToast(result.message || '操作失败', 'error'); }
  };

  const handleDelete = (group) => {
    Alert.alert('删除分组', `确定要删除「${group.name}」分组吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        const result = await deleteGroup(group.id);
        showToast(result.success ? '删除成功' : (result.message || '删除失败'), result.success ? 'success' : 'error');
      }},
    ]);
  };

  const renderItem = useCallback(({ item }) => (
    <View style={styles.groupItem}>
      <View style={styles.groupInfo}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <View style={styles.groupText}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupCount}>{item.contactCount || 0} 个联系人</Text>
        </View>
      </View>
      <View style={styles.groupActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}><Text style={styles.editBtnText}>编辑</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}><Text style={styles.deleteBtnText}>删除</Text></TouchableOpacity>
      </View>
    </View>
  ), [groups]);

  return (
    <View style={styles.container}>
      <FlatList data={groups} keyExtractor={(item) => String(item.id)} renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyView message="暂无分组" iconName="folder-outline" />}
        contentContainerStyle={styles.listContent} />

      <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
        <Text style={styles.addBtnText}>+ 新建分组</Text>
      </TouchableOpacity>

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kbAvoid}>
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editGroup ? '编辑分组' : '新建分组'}</Text>
                <Text style={styles.inputLabel}>分组名称</Text>
                <TextInput style={styles.modalInput} value={groupName} onChangeText={setGroupName} placeholder="请输入分组名称" placeholderTextColor={colors.textHint} autoFocus />
                <Text style={styles.inputLabel}>分组颜色</Text>
                <View style={styles.colorRow}>
                  {colors.groupColors.map((color) => (
                    <TouchableOpacity key={color} style={[styles.colorOption, { backgroundColor: color }, groupColor === color && styles.colorSelected]} onPress={() => setGroupColor(color)} />
                  ))}
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setModalVisible(false)}><Text style={styles.modalCancelText}>取消</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalConfirmBtn]} onPress={handleSave}><Text style={styles.modalConfirmText}>保存</Text></TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      <CustomToast {...toastProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: 80 },
  groupItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  groupInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  groupText: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  groupCount: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  groupActions: { flexDirection: 'row' },
  editBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  editBtnText: { fontSize: 14, color: colors.primary },
  deleteBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  deleteBtnText: { fontSize: 14, color: colors.error },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  addBtn: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: colors.primary, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  kbAvoid: { width: '100%', alignItems: 'center' },
  modalScroll: { alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  modalContent: { width: 300, backgroundColor: colors.surface, borderRadius: 14, padding: spacing.lg },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  inputLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  modalInput: { backgroundColor: colors.surfaceSecondary, borderRadius: 8, paddingHorizontal: spacing.md, height: 44, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  colorOption: { width: 36, height: 36, borderRadius: 18, marginRight: 10, marginBottom: 8 },
  colorSelected: { borderWidth: 3, borderColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  modalButtons: { flexDirection: 'row' },
  modalBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: 8, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: colors.surfaceSecondary, marginRight: spacing.sm },
  modalConfirmBtn: { backgroundColor: colors.primary },
  modalCancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  modalConfirmText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
});

export default GroupManageScreen;
