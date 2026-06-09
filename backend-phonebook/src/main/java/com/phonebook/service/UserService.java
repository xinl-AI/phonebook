package com.phonebook.service;

import com.phonebook.dto.response.UserResponse;

/**
 * 用户服务接口
 */
public interface UserService {

    /** 获取用户信息 */
    UserResponse getUserById(Long userId);

    /** 更新用户信息 */
    void updateUser(Long userId, String nickname, String phone, String email, Integer gender);

    /** 更新头像 */
    void updateAvatar(Long userId, String avatar);
}
