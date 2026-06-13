import { create } from 'zustand';
import { contactAPI } from '../api/contacts';

/**
 * 联系人状态管理 (Zustand)
 */
const useContactStore = create((set, get) => ({
  contacts: [],
  total: 0,
  currentPage: 1,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,

  selectedGroupId: null,
  keyword: '',

  favorites: [],

  loadContacts: async (page = 1, refresh = false) => {
    if (get().isLoading && !refresh) return;
    set({ isLoading: true, isRefreshing: refresh });

    try {
      const { selectedGroupId, keyword } = get();
      const params = { page, size: 20 };
      if (selectedGroupId) params.groupId = selectedGroupId;
      if (keyword) params.keyword = keyword;

      const result = await contactAPI.getList(params);
      if (result?.code === 200) {
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
    } catch (e) {
      /* 网络错误保持现有数据 */
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  refresh: () => get().loadContacts(1, true),

  loadMore: () => {
    const { hasMore, isLoading, currentPage } = get();
    if (hasMore && !isLoading) get().loadContacts(currentPage + 1);
  },

  setGroupFilter: (groupId) => {
    set({ selectedGroupId: groupId });
    get().loadContacts(1, true);
  },

  setKeyword: (keyword) => {
    set({ keyword });
    get().loadContacts(1, true);
  },

  loadFavorites: async () => {
    try {
      const result = await contactAPI.getFavorites();
      if (result?.code === 200) set({ favorites: result.data });
    } catch (e) { /* ignore */ }
  },

  toggleFavorite: async (contactId, isFavorite) => {
    try {
      // 乐观更新
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, isFavorite: isFavorite ? 1 : 0 } : c
        ),
      }));
      await contactAPI.toggleFavorite(contactId, isFavorite);
    } catch (e) {
      // 回滚
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, isFavorite: isFavorite ? 0 : 1 } : c
        ),
      }));
    }
  },

  removeContact: async (contactId) => {
    try {
      const result = await contactAPI.delete(contactId);
      if (result?.code === 200) {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== contactId),
          total: state.total - 1,
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
}));

export default useContactStore;
