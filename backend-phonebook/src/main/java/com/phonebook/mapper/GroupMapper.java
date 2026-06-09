package com.phonebook.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.phonebook.entity.Group;
import org.apache.ibatis.annotations.Mapper;

/**
 * 分组Mapper接口
 */
@Mapper
public interface GroupMapper extends BaseMapper<Group> {
    // BaseMapper已提供通用CRUD方法
}
