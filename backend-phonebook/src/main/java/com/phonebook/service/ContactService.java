package com.phonebook.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.phonebook.dto.request.ContactRequest;
import com.phonebook.dto.response.ContactResponse;

import java.util.List;

/**
 * 联系人服务接口
 */
public interface ContactService {

    /** 分页查询联系人列表 */
    IPage<ContactResponse> listContacts(Long userId, Integer page, Integer size,
                                        Long groupId, String keyword);

    /** 获取收藏联系人 */
    List<ContactResponse> getFavorites(Long userId);

    /** 获取联系人详情 */
    ContactResponse getContactById(Long userId, Long contactId);

    /** 添加联系人 */
    Long addContact(Long userId, ContactRequest request);

    /** 编辑联系人 */
    void updateContact(Long userId, Long contactId, ContactRequest request);

    /** 删除联系人（软删除） */
    void deleteContact(Long userId, Long contactId);

    /** 批量删除联系人 */
    int batchDeleteContacts(Long userId, List<Long> ids);

    /** 切换收藏状态 */
    void toggleFavorite(Long userId, Long contactId, Boolean isFavorite);
}
