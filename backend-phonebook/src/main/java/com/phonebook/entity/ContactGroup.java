package com.phonebook.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 联系人-分组关联实体类 - 对应contact_group表
 * 实现联系人与分组的"多对多"关系
 */
@Data
@TableName("contact_group")
public class ContactGroup {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 联系人ID */
    private Long contactId;

    /** 分组ID */
    private Long groupId;

    /** 关联时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
