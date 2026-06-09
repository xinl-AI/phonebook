package com.phonebook.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录响应数据
 */
@Data
@AllArgsConstructor
public class LoginResponse {

    /** JWT令牌 */
    private String token;

    /** 用户ID */
    private Long userId;

    /** 用户名 */
    private String username;

    /** 昵称 */
    private String nickname;

    /** 头像 */
    private String avatar;
}
