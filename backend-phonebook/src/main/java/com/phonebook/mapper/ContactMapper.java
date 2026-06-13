package com.phonebook.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.phonebook.entity.Contact;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 联系人Mapper接口
 */
@Mapper
public interface ContactMapper extends BaseMapper<Contact> {

    /**
     * 分页查询联系人列表（支持分组筛选和关键词搜索）
     */
    IPage<Contact> selectContactPage(Page<Contact> page,
                                     @Param("userId") Long userId,
                                     @Param("groupId") Long groupId,
                                     @Param("keyword") String keyword);

    /**
     * 查询收藏的联系人
     */
    IPage<Contact> selectFavorites(Page<Contact> page, @Param("userId") Long userId);

    /**
     * 查询回收站中的联系人（is_deleted=1）
     */
    IPage<Contact> selectDeletedContacts(Page<Contact> page, @Param("userId") Long userId);

    /**
     * 根据 ID 查询联系人（绕过逻辑删除过滤，用于恢复和永久删除）
     */
    Contact selectByIdIgnoreDeleted(@Param("id") Long id);

    /**
     * 绕过逻辑删除，恢复联系人（设置 is_deleted = 0）
     */
    int restoreById(@Param("id") Long id);

    /**
     * 物理删除（绕过 @TableLogic 的 is_deleted=0 过滤）
     */
    int physicalDeleteById(@Param("id") Long id);
}
