package com.phonebook.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分组实体类 - 对应group表
 */
@Data
@TableName("`group`")
public class Group {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 所属用户ID */
    private Long userId;

    /** 分组名称 */
    private String name;

    /** 分组颜色 */
    private String color;

    /** 分组图标 */
    private String icon;

    /** 排序序号 */
    private Integer sortOrder;

    /** 联系人数（冗余字段） */
    private Integer contactCount;

    /** 是否系统预设分组 */
    private Integer isSystem;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
