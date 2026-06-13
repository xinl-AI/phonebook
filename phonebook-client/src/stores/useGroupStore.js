import { create } from 'zustand';
import { groupAPI } from '../api/groups';

/**
 * 分组状态管理 (Zustand)
 */
const useGroupStore = create((set, get) => ({
  groups: [],
  isLoading: false,

  loadGroups: async () => {
    set({ isLoading: true });
    try {
      const result = await groupAPI.getList();
      if (result?.code === 200) set({ groups: result.data || [] });
    } catch (e) { /* network error */ }
    finally { set({ isLoading: false }); }
  },

  createGroup: async (data) => {
    try {
      const result = await groupAPI.create(data);
      if (result?.code === 200) { await get().loadGroups(); return { success: true, id: result.data }; }
      return { success: false, message: result?.message || '创建失败' };
    } catch (e) { return { success: false, message: '网络错误' }; }
  },

  updateGroup: async (id, data) => {
    try {
      const result = await groupAPI.update(id, data);
      if (result?.code === 200) { await get().loadGroups(); return { success: true }; }
      return { success: false, message: result?.message || '修改失败' };
    } catch (e) { return { success: false, message: '网络错误' }; }
  },

  deleteGroup: async (id, moveToId) => {
    try {
      const result = await groupAPI.delete(id, moveToId);
      if (result?.code === 200) { await get().loadGroups(); return { success: true }; }
      return { success: false, message: result?.message || '删除失败' };
    } catch (e) { return { success: false, message: '网络错误' }; }
  },

  moveContacts: async (contactIds, groupIds) => {
    try {
      const result = await groupAPI.moveContacts({ contactIds, groupIds });
      if (result?.code === 200) { await get().loadGroups(); return { success: true }; }
      return { success: false, message: result?.message || '移动失败' };
    } catch (e) { return { success: false, message: '网络错误' }; }
  },
}));

export default useGroupStore;
