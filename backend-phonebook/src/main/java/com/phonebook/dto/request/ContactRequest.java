package com.phonebook.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * 联系人新增/编辑请求参数
 */
@Data
public class ContactRequest {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "电话号码不能为空")
    private String phone;

    /** 备用电话 */
    private String secondPhone;

    /** 邮箱 */
    private String email;

    /** 备用邮箱 */
    private String secondEmail;

    /** 地址 */
    private String address;

    /** 生日 (yyyy-MM-dd) */
    private String birthday;

    /** 公司 */
    private String company;

    /** 职位 */
    private String position;

    /** 个人网站 */
    private String website;

    /** 备注 */
    private String remark;

    /** 头像URL */
    private String avatar;

    /** 所属分组ID列表 */
    private List<Long> groupIds;
}
