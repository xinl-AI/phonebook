import { create } from 'zustand';
import { contactAPI } from '../api/contacts';

/**
 * 联系人状态管理 (Zustand)
 *
 * 管理联系人列表、搜索、筛选、分页等状态
 */
const useContactStore = create((set, get) => ({
  // 联系人数据
  contacts: [],
  total: 0,
  currentPage: 1,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,

  // 筛选条件
  selectedGroupId: null,  // 当前选中的分组ID（null=全部）
  keyword: '',            // 搜索关键词

  // 收藏列表
  favorites: [],

  /** 加载联系人列表 */
  loadContacts: async (page = 1, refresh = false) => {
    if (get().isLoading) return;

    set({ isLoading: true, isRefreshing: refresh });
    try {
      const { selectedGroupId, keyword } = get();
      const params = { page, size: 20 };
      if (selectedGroupId) params.groupId = selectedGroupId;
      if (keyword) params.keyword = keyword;

      const result = await contactAPI.getList(params);
      if (result.code === 200) {
        const { records, total, current } = result.data;
        if (page === 1 || refresh) {
          set({ contacts: records, total, currentPage: current, hasMore: records.length >= 20 });
        } else {
          set((state) => ({
            contacts: [...state.contacts, ...records],
            total,
            currentPage: current,
            hasMore: records.length >= 20,
          }));
        }
      }
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  /** 刷新（下拉） */
  refresh: () => get().loadContacts(1, true),

  /** 加载更多（上拉） */
  loadMore: () => {
    const { hasMore, isLoading, currentPage } = get();
    if (hasMore && !isLoading) {
      get().loadContacts(currentPage + 1);
    }
  },

  /** 设置分组筛选 */
  setGroupFilter: (groupId) => {
    set({ selectedGroupId: groupId });
    get().loadContacts(1, true);
  },

  /** 设置搜索关键词 */
  setKeyword: (keyword) => {
    set({ keyword });
    // 防抖由useDebounce hook处理
    get().loadContacts(1, true);
  },

  /** 加载收藏列表 */
  loadFavorites: async () => {
    const result = await contactAPI.getFavorites();
    if (result.code === 200) {
      set({ favorites: result.data });
    }
  },

  /** 切换收藏 */
  toggleFavorite: async (contactId, isFavorite) => {
    await contactAPI.toggleFavorite(contactId, isFavorite);
    // 更新本地状态
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId ? { ...c, isFavorite: isFavorite ? 1 : 0 } : c
      ),
    }));
  },

  /** 删除联系人 */
  removeContact: async (contactId) => {
    const result = await contactAPI.delete(contactId);
    if (result.code === 200) {
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== contactId),
        total: state.total - 1,
      }));
      return true;
    }
    return false;
  },
}));

export default useContactStore;
