package com.phonebook.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 修改密码请求参数
 */
@Data
public class ChangePasswordRequest {

    @NotBlank(message = "原密码不能为空")
    private String oldPassword;

    @NotBlank(message = "新密码不能为空")
    private String newPassword;
}
