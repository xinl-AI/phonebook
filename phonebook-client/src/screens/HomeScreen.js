import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
 * 核心功能：分组筛选、搜索、联系人列表展示、添加/删除联系人
 */
const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [deleteModal, setDeleteModal] = useState({ visible: false, contact: null });
  const debouncedSearch = useDebounce(searchText, 300);

  const {
    contacts, isLoading, isRefreshing, selectedGroupId, favorites,
    loadContacts, refresh, loadMore, setGroupFilter, setKeyword,
    removeContact, loadFavorites,
  } = useContactStore();

  const { groups, loadGroups } = useGroupStore();
  const { user, logout } = useAuthStore();

  // 初始加载
  useEffect(() => {
    loadContacts();
    loadGroups();
  }, []);

  // 搜索防抖
  useEffect(() => {
    setKeyword(debouncedSearch);
  }, [debouncedSearch]);

  // 导航到添加联系人页
  const handleAddContact = useCallback(() => {
    navigation.navigate('ContactEdit', { mode: 'add' });
  }, [navigation]);

  // 点击联系人 → 详情页
  const handleContactPress = useCallback((contact) => {
    navigation.navigate('ContactDetail', { contactId: contact.id });
  }, [navigation]);

  // 长按联系人 → 删除确认
  const handleContactLongPress = useCallback((contact) => {
    setDeleteModal({ visible: true, contact });
  }, []);

  // 确认删除
  const handleDeleteConfirm = async () => {
    const contact = deleteModal.contact;
    if (contact) {
      const success = await removeContact(contact.id);
      if (success) {
        Alert.alert('提示', '删除成功');
      }
    }
    setDeleteModal({ visible: false, contact: null });
  };

  // 导航到分组管理
  const handleManageGroups = useCallback(() => {
    navigation.navigate('GroupManage');
  }, [navigation]);

  // 退出登录
  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => logout(),
      },
    ]);
  };

  // 渲染头部（用户信息栏）
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
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.headerBtnText}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染列表项
  const renderItem = ({ item }) => (
    <ContactItem
      contact={item}
      onPress={() => handleContactPress(item)}
      onLongPress={() => handleContactLongPress(item)}
    />
  );

  // 渲染列表分隔线
  const renderSeparator = () => <View style={styles.separator} />;

  // 列表头部（搜索栏 + 分组筛选）
  const ListHeader = (
    <View>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onClear={() => setSearchText('')}
      />
      <GroupHeader
        groups={groups}
        selectedId={selectedGroupId}
        onSelect={setGroupFilter}
        onManage={handleManageGroups}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      <FlatList
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyView
              message={searchText ? '没有找到匹配的联系人' : '还没有联系人，点击下方+号添加'}
              icon={searchText ? '🔍' : '📇'}
            />
          )
        }
        refreshing={isRefreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        stickyHeaderIndices={[0]} // 搜索栏吸顶
        contentContainerStyle={styles.listContent}
      />

      <FloatingButton onPress={handleAddContact} />

      {/* 删除确认弹窗 */}
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
    paddingVertical: spacing.md,
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
    color: '#FFFFFF',
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerBtnText: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.base + 44 + spacing.md,
  },
  listContent: {
    paddingBottom: 80,
  },
});

export default HomeScreen;
