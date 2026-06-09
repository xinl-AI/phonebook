import { create } from 'zustand';
import { groupAPI } from '../api/groups';

/**
 * 分组状态管理 (Zustand)
 */
const useGroupStore = create((set, get) => ({
  groups: [],
  isLoading: false,

  /** 加载所有分组 */
  loadGroups: async () => {
    set({ isLoading: true });
    try {
      const result = await groupAPI.getList();
      if (result.code === 200) {
        set({ groups: result.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  /** 创建分组 */
  createGroup: async (data) => {
    const result = await groupAPI.create(data);
    if (result.code === 200) {
      await get().loadGroups();
      return { success: true, id: result.data };
    }
    return { success: false, message: result.message };
  },

  /** 编辑分组 */
  updateGroup: async (id, data) => {
    const result = await groupAPI.update(id, data);
    if (result.code === 200) {
      await get().loadGroups();
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  /** 删除分组 */
  deleteGroup: async (id, moveToId) => {
    const result = await groupAPI.delete(id, moveToId);
    if (result.code === 200) {
      await get().loadGroups();
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  /** 移动联系人到分组 */
  moveContacts: async (contactIds, groupIds) => {
    const result = await groupAPI.moveContacts({ contactIds, groupIds });
    if (result.code === 200) {
      await get().loadGroups();
      return { success: true };
    }
    return { success: false, message: result.message };
  },
}));

export default useGroupStore;
