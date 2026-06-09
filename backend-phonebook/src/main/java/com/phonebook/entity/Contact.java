package com.phonebook.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 联系人实体类 - 对应contact表
 * 使用软删除：is_deleted=1表示已删除
 */
@Data
@TableName("contact")
public class Contact {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 所属用户ID */
    private Long userId;

    /** 姓名 */
    private String name;

    /** 拼音（用于搜索排序） */
    private String phoneticName;

    /** 主电话号码 */
    private String phone;

    /** 备用电话 */
    private String secondPhone;

    /** 邮箱 */
    private String email;

    /** 备用邮箱 */
    private String secondEmail;

    /** 地址 */
    private String address;

    /** 生日 */
    private LocalDate birthday;

    /** 公司 */
    private String company;

    /** 职位 */
    private String position;

    /** 个人网站 */
    private String website;

    /** 备注 */
    private String remark;

    /** 是否收藏：0否 1是 */
    private Integer isFavorite;

    /** 头像URL */
    private String avatar;

    /** 软删除标记：0未删除 1已删除 */
    @TableLogic(value = "0", delval = "1")
    private Integer isDeleted;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
