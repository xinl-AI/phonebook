package com.phonebook.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户信息响应数据
 */
@Data
public class UserResponse {

    private Long id;
    private String username;
    private String nickname;
    private String phone;
    private String email;
    private String avatar;
    private Integer gender;
    private String role;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createTime;
}
