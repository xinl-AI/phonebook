import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useContactStore from '../stores/useContactStore';
import useGroupStore from '../stores/useGroupStore';
import useAuthStore from '../stores/useAuthStore';
import ContactItem from '../components/ContactItem';
import SearchBar from '../components/SearchBar';
import GroupHeader from '../components/GroupHeader';
import FloatingButton from '../components/FloatingButton';
import EmptyView from '../components/EmptyView';
import CustomModal from '../components/CustomModal';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import useDebounce from '../hooks/useDebounce';

/**
 * 主页（联系人列表）
 * - 搜索栏和分组标签在 FlatList 外部，避免切换分组时列表跳动
 * - 删除/恢复后自动同步分组人数
 */
const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [deleteModal, setDeleteModal] = useState({ visible: false, contact: null });
  const debouncedSearch = useDebounce(searchText, 300);
  const listRef = useRef(null);

  const {
    contacts, isLoading, isRefreshing, selectedGroupId,
    loadContacts, refresh, loadMore, setGroupFilter, setKeyword,
    removeContact,
  } = useContactStore();

  const { groups, loadGroups } = useGroupStore();
  const { user } = useAuthStore();

  // 初始加载
  useEffect(() => {
    loadContacts();
    loadGroups();
  }, []);

  // 页面聚焦时刷新分组计数
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGroups();
    });
    return unsubscribe;
  }, [navigation, loadGroups]);

  // 搜索防抖
  useEffect(() => {
    setKeyword(debouncedSearch);
  }, [debouncedSearch]);

  // 切换分组——手动启动刷新但不丢数据
  const handleGroupSelect = useCallback((groupId) => {
    setGroupFilter(groupId);
  }, [setGroupFilter]);

  // 确认删除——同时刷新分组计数
  const handleDeleteConfirm = async () => {
    const contact = deleteModal.contact;
    if (contact) {
      const success = await removeContact(contact.id);
      if (success) {
        loadGroups(); // 同步分组人数
      }
    }
    setDeleteModal({ visible: false, contact: null });
  };

  // 头部用户栏
  const renderHeader = () => (
    <View style={styles.headerBar}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => navigation.navigate('Profile')}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(user?.nickname || user?.username || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userText}>
          <Text style={styles.greeting}>你好，</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.nickname || user?.username || '用户'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('RecycleBin')}
          accessible accessibilityLabel="回收站">
          <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Settings')}
          accessible accessibilityLabel="设置">
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      {/* 搜索栏和分组标签在 FlatList 外部 → 切换分组不跳动 */}
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onClear={() => setSearchText('')}
      />
      <GroupHeader
        groups={groups}
        selectedId={selectedGroupId}
        onSelect={handleGroupSelect}
        onManage={() => navigation.navigate('GroupManage')}
      />

      <FlatList
        ref={listRef}
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ContactItem
            contact={item}
            onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
            onLongPress={() => setDeleteModal({ visible: true, contact: item })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyView
              iconName={searchText ? 'search-outline' : 'people-outline'}
              message={searchText ? '没有找到匹配的联系人' : '还没有联系人，点击 + 添加'}
            />
          )
        }
        refreshing={isRefreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton onPress={() => navigation.navigate('ContactEdit', { mode: 'add' })} />

      <CustomModal
        visible={deleteModal.visible}
        title="删除联系人"
        message={`确定要删除「${deleteModal.contact?.name}」吗？\n删除后可在回收站恢复。`}
        confirmText="删除"
        cancelText="取消"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ visible: false, contact: null })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  userText: {
    marginLeft: spacing.sm,
  },
  greeting: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.base + 44 + spacing.md,
  },
  listContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
});

export default HomeScreen;
