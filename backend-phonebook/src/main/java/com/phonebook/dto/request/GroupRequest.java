package com.phonebook.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 分组新增/编辑请求参数
 */
@Data
public class GroupRequest {

    @NotBlank(message = "分组名称不能为空")
    private String name;

    /** 分组颜色（默认#07C160） */
    private String color;

    /** 分组图标 */
    private String icon;
}
