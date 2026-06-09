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
}
