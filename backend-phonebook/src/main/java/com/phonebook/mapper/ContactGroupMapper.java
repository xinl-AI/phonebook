package com.phonebook.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.phonebook.entity.ContactGroup;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 联系人-分组关联表 Mapper接口
 */
@Mapper
public interface ContactGroupMapper extends BaseMapper<ContactGroup> {

    /**
     * 查询某联系人的所有分组ID
     */
    @Select("SELECT group_id FROM contact_group WHERE contact_id = #{contactId}")
    List<Long> selectGroupIdsByContactId(@Param("contactId") Long contactId);

    /**
     * 删除某联系人的所有分组关联
     */
    @Delete("DELETE FROM contact_group WHERE contact_id = #{contactId}")
    int deleteByContactId(@Param("contactId") Long contactId);

    /**
     * 查询某分组下的所有联系人ID
     */
    @Select("SELECT contact_id FROM contact_group WHERE group_id = #{groupId}")
    List<Long> selectContactIdsByGroupId(@Param("groupId") Long groupId);
}
