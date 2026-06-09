package com.phonebook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.phonebook.dto.request.ChangePasswordRequest;
import com.phonebook.dto.request.LoginRequest;
import com.phonebook.dto.request.RegisterRequest;
import com.phonebook.dto.response.LoginResponse;
import com.phonebook.dto.response.UserResponse;
import com.phonebook.entity.Group;
import com.phonebook.entity.User;
import com.phonebook.exception.BusinessException;
import com.phonebook.mapper.GroupMapper;
import com.phonebook.mapper.UserMapper;
import com.phonebook.service.AuthService;
import com.phonebook.utils.JwtUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 认证服务实现
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final GroupMapper groupMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserMapper userMapper,
                           GroupMapper groupMapper,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.groupMapper = groupMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public Long register(RegisterRequest request) {
        // 检查用户名是否已存在
        User existUser = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        // 检查手机号是否已注册
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            User phoneUser = userMapper.selectOne(
                    new LambdaQueryWrapper<User>().eq(User::getPhone, request.getPhone()));
            if (phoneUser != null) {
                throw new BusinessException("手机号已被注册");
            }
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getUsername()); // 默认昵称=用户名
        // 空字符串转为null，避免唯一键冲突
        String phone = request.getPhone();
        user.setPhone(phone != null && phone.isEmpty() ? null : phone);
        String email = request.getEmail();
        user.setEmail(email != null && email.isEmpty() ? null : email);
        user.setStatus(1);
        user.setRole("user");
        userMapper.insert(user);

        // 为新用户创建3个系统预设分组
        String[][] defaultGroups = {
                {"家人", "#FF6B6B"},
                {"朋友", "#4ECDC4"},
                {"同事", "#07C160"}
        };
        for (int i = 0; i < defaultGroups.length; i++) {
            Group group = new Group();
            group.setUserId(user.getId());
            group.setName(defaultGroups[i][0]);
            group.setColor(defaultGroups[i][1]);
            group.setSortOrder(i);
            group.setContactCount(0);
            group.setIsSystem(1); // 标记为系统预设分组
            groupMapper.insert(group);
        }

        return user.getId();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        // 检查账号状态
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        // 验证密码（BCrypt）
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 更新最后登录时间
        user.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(user);

        // 生成JWT Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getNickname(), user.getAvatar());
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(user, response);
        return response;
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证原密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        // 更新为新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
    }

    @Override
    public void logout(Long userId) {
        // 无状态JWT：客户端删除本地Token即可
        // 服务端只需更新最后登录时间
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setLastLoginTime(LocalDateTime.now());
            userMapper.updateById(user);
        }
    }
}
