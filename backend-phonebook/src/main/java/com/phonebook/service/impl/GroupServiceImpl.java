package com.phonebook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.phonebook.dto.request.GroupRequest;
import com.phonebook.dto.response.ContactResponse;
import com.phonebook.dto.response.GroupResponse;
import com.phonebook.entity.Contact;
import com.phonebook.entity.ContactGroup;
import com.phonebook.entity.Group;
import com.phonebook.exception.BusinessException;
import com.phonebook.mapper.ContactGroupMapper;
import com.phonebook.mapper.ContactMapper;
import com.phonebook.mapper.GroupMapper;
import com.phonebook.service.GroupService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 分组服务实现
 */
@Service
public class GroupServiceImpl implements GroupService {

    private final GroupMapper groupMapper;
    private final ContactMapper contactMapper;
    private final ContactGroupMapper contactGroupMapper;

    public GroupServiceImpl(GroupMapper groupMapper,
                            ContactMapper contactMapper,
                            ContactGroupMapper contactGroupMapper) {
        this.groupMapper = groupMapper;
        this.contactMapper = contactMapper;
        this.contactGroupMapper = contactGroupMapper;
    }

    @Override
    public List<GroupResponse> listGroups(Long userId) {
        List<Group> groups = groupMapper.selectList(
                new LambdaQueryWrapper<Group>()
                        .eq(Group::getUserId, userId)
                        .orderByAsc(Group::getSortOrder));
        return groups.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Long createGroup(Long userId, GroupRequest request) {
        // 检查分组名是否已存在
        Group existGroup = groupMapper.selectOne(
                new LambdaQueryWrapper<Group>()
                        .eq(Group::getUserId, userId)
                        .eq(Group::getName, request.getName()));
        if (existGroup != null) {
            throw new BusinessException("分组名称已存在");
        }

        Group group = new Group();
        group.setUserId(userId);
        group.setName(request.getName());
        group.setColor(request.getColor() != null ? request.getColor() : "#07C160");
        group.setIcon(request.getIcon());
        group.setSortOrder(0);
        group.setContactCount(0);
        group.setIsSystem(0);
        groupMapper.insert(group);

        return group.getId();
    }

    @Override
    public void updateGroup(Long userId, Long groupId, GroupRequest request) {
        Group group = groupMapper.selectById(groupId);
        if (group == null || !group.getUserId().equals(userId)) {
            throw new BusinessException("分组不存在");
        }

        // 检查重名
        Group existGroup = groupMapper.selectOne(
                new LambdaQueryWrapper<Group>()
                        .eq(Group::getUserId, userId)
                        .eq(Group::getName, request.getName())
                        .ne(Group::getId, groupId));
        if (existGroup != null) {
            throw new BusinessException("分组名称已存在");
        }

        group.setName(request.getName());
        if (request.getColor() != null) {
            group.setColor(request.getColor());
        }
        if (request.getIcon() != null) {
            group.setIcon(request.getIcon());
        }
        groupMapper.updateById(group);
    }

    @Override
    @Transactional
    public void deleteGroup(Long userId, Long groupId, Long moveToId) {
        Group group = groupMapper.selectById(groupId);
        if (group == null || !group.getUserId().equals(userId)) {
            throw new BusinessException("分组不存在");
        }

        // 获取该分组下所有关联的联系人
        List<Long> contactIds = contactGroupMapper.selectContactIdsByGroupId(groupId);

        if (moveToId != null && !contactIds.isEmpty()) {
            // 将所有联系人移至目标分组
            // 先删除原有分组关联（属于当前分组的）
            for (Long contactId : contactIds) {
                contactGroupMapper.delete(
                        new LambdaQueryWrapper<ContactGroup>()
                                .eq(ContactGroup::getContactId, contactId)
                                .eq(ContactGroup::getGroupId, groupId));
                // 添加到目标分组（如果尚未关联）
                ContactGroup existCg = contactGroupMapper.selectOne(
                        new LambdaQueryWrapper<ContactGroup>()
                                .eq(ContactGroup::getContactId, contactId)
                                .eq(ContactGroup::getGroupId, moveToId));
                if (existCg == null) {
                    ContactGroup cg = new ContactGroup();
                    cg.setContactId(contactId);
                    cg.setGroupId(moveToId);
                    contactGroupMapper.insert(cg);
                }
            }
            // 更新目标分组计数
            List<Long> moveToContactIds = contactGroupMapper.selectContactIdsByGroupId(moveToId);
            Group targetGroup = groupMapper.selectById(moveToId);
            if (targetGroup != null) {
                targetGroup.setContactCount(moveToContactIds.size());
                groupMapper.updateById(targetGroup);
            }
        } else if (!contactIds.isEmpty()) {
            // 未指定目标分组：直接删除所有关联
            for (Long contactId : contactIds) {
                contactGroupMapper.delete(
                        new LambdaQueryWrapper<ContactGroup>()
                                .eq(ContactGroup::getContactId, contactId)
                                .eq(ContactGroup::getGroupId, groupId));
            }
        }

        // 删除分组
        groupMapper.deleteById(groupId);
    }

    @Override
    public IPage<ContactResponse> getGroupContacts(Long userId, Long groupId, Integer page, Integer size) {
        // 验证分组所属
        Group group = groupMapper.selectById(groupId);
        if (group == null || !group.getUserId().equals(userId)) {
            throw new BusinessException("分组不存在");
        }

        // 获取分组下的联系人ID
        List<Long> contactIds = contactGroupMapper.selectContactIdsByGroupId(groupId);
        if (contactIds.isEmpty()) {
            Page<ContactResponse> emptyPage = new Page<>(page, size, 0);
            return emptyPage;
        }

        // 查询联系人详情
        Page<Contact> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Contact> wrapper = new LambdaQueryWrapper<Contact>()
                .in(Contact::getId, contactIds)
                .eq(Contact::getIsDeleted, 0);
        IPage<Contact> contactPage = contactMapper.selectPage(pageParam, wrapper);

        return contactPage.convert(contact -> {
            ContactResponse response = new ContactResponse();
            BeanUtils.copyProperties(contact, response);
            return response;
        });
    }

    @Override
    @Transactional
    public void moveContacts(Long userId, List<Long> contactIds, List<Long> groupIds) {
        for (Long contactId : contactIds) {
            // 验证联系人所属
            Contact contact = contactMapper.selectById(contactId);
            if (contact == null || !contact.getUserId().equals(userId)) {
                continue;
            }

            // 清除现有分组关联
            contactGroupMapper.deleteByContactId(contactId);

            // 建立新关联
            for (Long groupId : groupIds) {
                ContactGroup cg = new ContactGroup();
                cg.setContactId(contactId);
                cg.setGroupId(groupId);
                contactGroupMapper.insert(cg);
            }
        }

        // 更新所有受影响分组计数
        for (Long groupId : groupIds) {
            List<Long> ids = contactGroupMapper.selectContactIdsByGroupId(groupId);
            Group group = groupMapper.selectById(groupId);
            if (group != null) {
                group.setContactCount(ids.size());
                groupMapper.updateById(group);
            }
        }
    }

    @Override
    @Transactional
    public void sortGroups(Long userId, List<Long> groupIds) {
        for (int i = 0; i < groupIds.size(); i++) {
            Group group = new Group();
            group.setId(groupIds.get(i));
            group.setSortOrder(i);
            groupMapper.updateById(group); // MyBatis-Plus updates only non-null fields
        }
    }

    private GroupResponse convertToResponse(Group group) {
        GroupResponse response = new GroupResponse();
        BeanUtils.copyProperties(group, response);
        return response;
    }
}
