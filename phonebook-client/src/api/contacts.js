import client from './client';

/**
 * 联系人相关API
 */
export const contactAPI = {
  /** 获取联系人列表（分页+分组筛选+搜索） */
  getList: (params) => client.get('/api/contacts', { params }),

  /** 获取收藏联系人 */
  getFavorites: () => client.get('/api/contacts/favorite'),

  /** 获取联系人详情 */
  getDetail: (id) => client.get(`/api/contacts/${id}`),

  /** 添加联系人 */
  add: (data) => client.post('/api/contacts', data),

  /** 编辑联系人 */
  update: (id, data) => client.put(`/api/contacts/${id}`, data),

  /** 删除联系人 */
  delete: (id) => client.delete(`/api/contacts/${id}`),

  /** 批量删除 */
  batchDelete: (ids) => client.delete('/api/contacts/batch', { data: ids }),

  /** 搜索联系人 */
  search: (params) => client.get('/api/contacts/search', { params }),

  /** 切换收藏 */
  toggleFavorite: (id, isFavorite) =>
    client.put(`/api/contacts/${id}/favorite`, isFavorite, {
      headers: { 'Content-Type': 'application/json' },
    }),
};
