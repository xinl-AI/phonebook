package com.phonebook.service.impl;

import com.phonebook.dto.response.UserResponse;
import com.phonebook.entity.User;
import com.phonebook.exception.BusinessException;
import com.phonebook.mapper.UserMapper;
import com.phonebook.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

/**
 * 用户服务实现
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(user, response);
        return response;
    }

    @Override
    public void updateUser(Long userId, String nickname, String phone, String email, Integer gender) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (nickname != null) user.setNickname(nickname);
        // 空字符串转为null，避免唯一键冲突
        if (phone != null) user.setPhone(phone.isEmpty() ? null : phone);
        if (email != null) user.setEmail(email.isEmpty() ? null : email);
        if (gender != null) user.setGender(gender);

        userMapper.updateById(user);
    }

    @Override
    public void updateAvatar(Long userId, String avatar) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setAvatar(avatar);
        userMapper.updateById(user);
    }
}
