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
import java.util.ArrayList;
import java.util.List;
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

        // 转换为响应DTO，并填充分组信息
        return contactPage.convert(contact -> convertToResponse(contact));
    }

    @Override
    public List<ContactResponse> getFavorites(Long userId) {
        Page<Contact> page = new Page<>(1, 100);
        IPage<Contact> contactPage = contactMapper.selectFavorites(page, userId);
        return contactPage.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
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

    /**
     * 将Contact实体转换为响应DTO，包含分组信息
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
