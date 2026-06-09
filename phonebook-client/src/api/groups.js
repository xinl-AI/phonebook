import client from './client';

/**
 * 分组相关API
 */
export const groupAPI = {
  /** 获取所有分组 */
  getList: () => client.get('/api/groups'),

  /** 创建分组 */
  create: (data) => client.post('/api/groups', data),

  /** 编辑分组 */
  update: (id, data) => client.put(`/api/groups/${id}`, data),

  /** 删除分组 */
  delete: (id, moveToId) =>
    client.delete(`/api/groups/${id}`, { params: { moveToId } }),

  /** 获取分组下的联系人 */
  getContacts: (id, params) =>
    client.get(`/api/groups/${id}/contacts`, { params }),

  /** 移动联系人到分组 */
  moveContacts: (data) => client.post('/api/groups/move', data),

  /** 调整分组排序 */
  sort: (groupIds) => client.put('/api/groups/sort', groupIds),
};
