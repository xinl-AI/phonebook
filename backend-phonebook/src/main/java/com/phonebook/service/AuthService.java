package com.phonebook.service;

import com.phonebook.dto.request.ChangePasswordRequest;
import com.phonebook.dto.request.LoginRequest;
import com.phonebook.dto.request.RegisterRequest;
import com.phonebook.dto.response.LoginResponse;
import com.phonebook.dto.response.UserResponse;

/**
 * 认证服务接口
 */
public interface AuthService {

    /** 用户注册 */
    Long register(RegisterRequest request);

    /** 用户登录 */
    LoginResponse login(LoginRequest request);

    /** 获取当前用户信息 */
    UserResponse getCurrentUser(Long userId);

    /** 修改密码 */
    void changePassword(Long userId, ChangePasswordRequest request);

    /** 退出登录 */
    void logout(Long userId);
}
