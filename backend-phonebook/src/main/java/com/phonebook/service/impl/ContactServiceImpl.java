package com.phonebook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.phonebook.dto.request.ContactRequest;
import com.phonebook.dto.response.ContactResponse;
import com.phonebook.entity.Contact;
import com.phonebook.entity.ContactGroup;
import com.phonebook.entity.Group;
import com.phonebook.exception.BusinessException;
import com.phonebook.mapper.ContactGroupMapper;
import com.phonebook.mapper.ContactMapper;
import com.phonebook.mapper.GroupMapper;
import com.phonebook.service.ContactService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 联系人服务实现
 */
@Service
public class ContactServiceImpl implements ContactService {

    private final ContactMapper contactMapper;
    private final GroupMapper groupMapper;
    private final ContactGroupMapper contactGroupMapper;

    public ContactServiceImpl(ContactMapper contactMapper,
                              GroupMapper groupMapper,
                              ContactGroupMapper contactGroupMapper) {
        this.contactMapper = contactMapper;
        this.groupMapper = groupMapper;
        this.contactGroupMapper = contactGroupMapper;
    }

    @Override
    public IPage<ContactResponse> listContacts(Long userId, Integer page, Integer size,
                                                Long groupId, String keyword) {
        Page<Contact> pageParam = new Page<>(page, size);
        IPage<Contact> contactPage = contactMapper.selectContactPage(pageParam, userId, groupId, keyword);

        // 批量加载分组信息（消灭N+1）：2次查询搞定整页数据
        Map<Long, List<ContactResponse.GroupSimple>> groupMap = batchLoadGroups(
                contactPage.getRecords().stream().map(Contact::getId).collect(Collectors.toList()));

        return contactPage.convert(contact -> {
            ContactResponse resp = new ContactResponse();
            BeanUtils.copyProperties(contact, resp);
            resp.setGroups(groupMap.getOrDefault(contact.getId(), Collections.emptyList()));
            return resp;
        });
    }

    @Override
    public List<ContactResponse> getFavorites(Long userId) {
        Page<Contact> page = new Page<>(1, 100);
        IPage<Contact> contactPage = contactMapper.selectFavorites(page, userId);
        List<Contact> records = contactPage.getRecords();

        // 批量加载分组
        Map<Long, List<ContactResponse.GroupSimple>> groupMap = batchLoadGroups(
                records.stream().map(Contact::getId).collect(Collectors.toList()));

        return records.stream().map(contact -> {
            ContactResponse resp = new ContactResponse();
            BeanUtils.copyProperties(contact, resp);
            resp.setGroups(groupMap.getOrDefault(contact.getId(), Collections.emptyList()));
            return resp;
        }).collect(Collectors.toList());
    }

    @Override
    public ContactResponse getContactById(Long userId, Long contactId) {
        Contact contact = contactMapper.selectById(contactId);
        if (contact == null || !contact.getUserId().equals(userId)) {
            throw new BusinessException("联系人不存在");
        }
        return convertToResponse(contact);
    }

    @Override
    @Transactional
    public Long addContact(Long userId, ContactRequest request) {
        Contact contact = new Contact();
        BeanUtils.copyProperties(request, contact);
        contact.setUserId(userId);

        // 处理生日日期
        if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
            try {
                contact.setBirthday(LocalDate.parse(request.getBirthday()));
            } catch (Exception e) {
                throw new BusinessException("生日格式错误，请使用yyyy-MM-dd格式");
            }
        }

        contactMapper.insert(contact);

        // 处理分组关联
        if (request.getGroupIds() != null && !request.getGroupIds().isEmpty()) {
            for (Long groupId : request.getGroupIds()) {
                ContactGroup cg = new ContactGroup();
                cg.setContactId(contact.getId());
                cg.setGroupId(groupId);
                contactGroupMapper.insert(cg);
            }
            // 更新分组联系人计数
            updateGroupContactCount(request.getGroupIds());
        }

        return contact.getId();
    }

    @Override
    @Transactional
    public void updateContact(Long userId, Long contactId, ContactRequest request) {
        Contact contact = contactMapper.selectById(contactId);
        if (contact == null || !contact.getUserId().equals(userId)) {
            throw new BusinessException("联系人不存在");
        }

        BeanUtils.copyProperties(request, contact, "userId", "id");
        contact.setId(contactId);
        contact.setUserId(userId);

        // 处理生日日期
        if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
            try {
                contact.setBirthday(LocalDate.parse(request.getBirthday()));
            } catch (Exception e) {
                throw new BusinessException("生日格式错误");
            }
        } else {
            contact.setBirthday(null);
        }

        contactMapper.updateById(contact);

        // 更新分组关联：先删后增
        List<Long> oldGroupIds = contactGroupMapper.selectGroupIdsByContactId(contactId);
        contactGroupMapper.deleteByContactId(contactId);

        if (request.getGroupIds() != null && !request.getGroupIds().isEmpty()) {
            for (Long groupId : request.getGroupIds()) {
                ContactGroup cg = new ContactGroup();
                cg.setContactId(contactId);
                cg.setGroupId(groupId);
                contactGroupMapper.insert(cg);
            }
        }

        // 刷新受影响的全部分组计数
        List<Long> allGroupIds = new ArrayList<>();
        allGroupIds.addAll(oldGroupIds);
        if (request.getGroupIds() != null) {
            allGroupIds.addAll(request.getGroupIds());
        }
        updateGroupContactCount(allGroupIds.stream().distinct().collect(Collectors.toList()));
    }

    @Override
    @Transactional
    public void deleteContact(Long userId, Long contactId) {
        Contact contact = contactMapper.selectById(contactId);
        if (contact == null || !contact.getUserId().equals(userId)) {
            throw new BusinessException("联系人不存在");
        }

        // 软删除：MyBatis-Plus的@TableLogic自动设置is_deleted=1
        contactMapper.deleteById(contactId);

        // 更新受影响的分组计数
        List<Long> groupIds = contactGroupMapper.selectGroupIdsByContactId(contactId);
        updateGroupContactCount(groupIds);
    }

    @Override
    @Transactional
    public int batchDeleteContacts(Long userId, List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            Contact contact = contactMapper.selectById(id);
            if (contact != null && contact.getUserId().equals(userId)) {
                contactMapper.deleteById(id);
                List<Long> groupIds = contactGroupMapper.selectGroupIdsByContactId(id);
                updateGroupContactCount(groupIds);
                count++;
            }
        }
        return count;
    }

    @Override
    public void toggleFavorite(Long userId, Long contactId, Boolean isFavorite) {
        Contact contact = contactMapper.selectById(contactId);
        if (contact == null || !contact.getUserId().equals(userId)) {
            throw new BusinessException("联系人不存在");
        }
        contact.setIsFavorite(isFavorite ? 1 : 0);
        contactMapper.updateById(contact);
    }

    @Override
    public IPage<ContactResponse> getDeletedContacts(Long userId, Integer page, Integer size) {
        Page<Contact> pageParam = new Page<>(page, size);
        IPage<Contact> contactPage = contactMapper.selectDeletedContacts(pageParam, userId);

        // 批量加载分组
        Map<Long, List<ContactResponse.GroupSimple>> groupMap = batchLoadGroups(
                contactPage.getRecords().stream().map(Contact::getId).collect(Collectors.toList()));

        return contactPage.convert(contact -> {
            ContactResponse response = new ContactResponse();
            BeanUtils.copyProperties(contact, response);
            response.setGroups(groupMap.getOrDefault(contact.getId(), Collections.emptyList()));
            return response;
        });
    }

    @Override
    @Transactional
    public void restoreContact(Long userId, Long contactId) {
        // 使用自定义 SQL 绕过 MyBatis-Plus 逻辑删除过滤
        Contact contact = contactMapper.selectByIdIgnoreDeleted(contactId);
        if (contact == null || !contact.getUserId().equals(userId)) {
            throw new BusinessException("联系人不存在");
        }
        if (contact.getIsDeleted() == 0) {
            throw new BusinessException("联系人未被删除");
        }

        // 恢复：使用自定义 SQL 绕过 @TableLogic 的 WHERE 过滤
        contactMapper.restoreById(contactId);

        // 更新分组计数
        List<Long> groupIds = contactGroupMapper.selectGroupIdsByContactId(contactId);
        updateGroupContactCount(groupIds);
    }

    @Override
    @Transactional
    public void permanentDelete(Long userId, Long contactId) {
        Contact contact = contactMapper.selectByIdIgnoreDeleted(contactId);
        if (contact == null || !contact.getUserId().equals(userId)) {
            throw new BusinessException("联系人不存在");
        }

        // 清除分组关联
        List<Long> groupIds = contactGroupMapper.selectGroupIdsByContactId(contactId);
        contactGroupMapper.deleteByContactId(contactId);

        // 物理删除：使用自定义 SQL 绕过 @TableLogic 的 is_deleted=0 过滤
        contactMapper.physicalDeleteById(contactId);

        // 更新分组计数（已清除关联）
        updateGroupContactCount(groupIds);
    }

    /**
     * 批量加载联系人分组信息（消灭 N+1 查询）
     * 2 次查询：一次查所有 contact_group 关联，一次查所有 group 详情
     */
    private Map<Long, List<ContactResponse.GroupSimple>> batchLoadGroups(List<Long> contactIds) {
        if (contactIds.isEmpty()) return Collections.emptyMap();

        // 一次查询获取所有关联
        List<ContactGroup> allRelations = contactGroupMapper.selectByContactIds(contactIds);

        // 收集所有 groupId
        Set<Long> groupIdSet = new HashSet<>();
        Map<Long, List<Long>> contactToGroups = new HashMap<>();
        for (ContactGroup cg : allRelations) {
            groupIdSet.add(cg.getGroupId());
            contactToGroups.computeIfAbsent(cg.getContactId(), k -> new ArrayList<>()).add(cg.getGroupId());
        }

        // 一次查询获取所有分组详情
        Map<Long, Group> groupMap = new HashMap<>();
        if (!groupIdSet.isEmpty()) {
            List<Group> groups = groupMapper.selectBatchIds(new ArrayList<>(groupIdSet));
            for (Group g : groups) groupMap.put(g.getId(), g);
        }

        // 组装结果
        Map<Long, List<ContactResponse.GroupSimple>> result = new HashMap<>();
        for (Long contactId : contactIds) {
            List<Long> gIds = contactToGroups.getOrDefault(contactId, Collections.emptyList());
            List<ContactResponse.GroupSimple> simples = new ArrayList<>();
            for (Long gId : gIds) {
                Group g = groupMap.get(gId);
                if (g != null) {
                    ContactResponse.GroupSimple gs = new ContactResponse.GroupSimple();
                    gs.setId(g.getId());
                    gs.setName(g.getName());
                    gs.setColor(g.getColor());
                    simples.add(gs);
                }
            }
            result.put(contactId, simples);
        }
        return result;
    }

    /**
     * 将Contact实体转换为响应DTO，包含分组信息（单个联系人使用）
     */
    private ContactResponse convertToResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        BeanUtils.copyProperties(contact, response);

        // 查询联系人所属分组
        List<Long> groupIds = contactGroupMapper.selectGroupIdsByContactId(contact.getId());
        if (!groupIds.isEmpty()) {
            List<Group> groups = groupMapper.selectBatchIds(groupIds);
            List<ContactResponse.GroupSimple> groupList = groups.stream().map(g -> {
                ContactResponse.GroupSimple gs = new ContactResponse.GroupSimple();
                gs.setId(g.getId());
                gs.setName(g.getName());
                gs.setColor(g.getColor());
                return gs;
            }).collect(Collectors.toList());
            response.setGroups(groupList);
        }

        return response;
    }

    /**
     * 更新分组联系人计数（同步冗余字段）
     */
    private void updateGroupContactCount(List<Long> groupIds) {
        for (Long groupId : groupIds) {
            List<Long> contactIds = contactGroupMapper.selectContactIdsByGroupId(groupId);
            Group group = groupMapper.selectById(groupId);
            if (group != null) {
                group.setContactCount(contactIds.size());
                groupMapper.updateById(group);
            }
        }
    }
}
