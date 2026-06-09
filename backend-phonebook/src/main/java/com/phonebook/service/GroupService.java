package com.phonebook.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.phonebook.dto.request.GroupRequest;
import com.phonebook.dto.response.ContactResponse;
import com.phonebook.dto.response.GroupResponse;

import java.util.List;

/**
 * 分组服务接口
 */
public interface GroupService {

    /** 获取用户所有分组 */
    List<GroupResponse> listGroups(Long userId);

    /** 创建分组 */
    Long createGroup(Long userId, GroupRequest request);

    /** 编辑分组 */
    void updateGroup(Long userId, Long groupId, GroupRequest request);

    /** 删除分组（联系人移至默认分组） */
    void deleteGroup(Long userId, Long groupId, Long moveToId);

    /** 获取分组下的联系人 */
    IPage<ContactResponse> getGroupContacts(Long userId, Long groupId, Integer page, Integer size);

    /** 移动联系人到分组 */
    void moveContacts(Long userId, List<Long> contactIds, List<Long> groupIds);

    /** 调整分组排序 */
    void sortGroups(Long userId, List<Long> groupIds);
}
