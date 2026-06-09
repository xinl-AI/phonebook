package com.phonebook.controller;

import com.phonebook.service.UserService;
import com.phonebook.utils.Result;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户控制器 - 处理用户信息相关接口
 * 路径前缀: /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** 获取用户信息 */
    @GetMapping("/{id}")
    public Result<?> getUser(@PathVariable Long id) {
        return Result.ok(userService.getUserById(id));
    }

    /** 更新用户信息 */
    @PutMapping("/profile")
    public Result<?> updateProfile(@RequestBody Map<String, Object> params) {
        Long userId = getCurrentUserId();
        String nickname = (String) params.get("nickname");
        String phone = (String) params.get("phone");
        String email = (String) params.get("email");
        Integer gender = params.get("gender") != null ? ((Number) params.get("gender")).intValue() : null;
        userService.updateUser(userId, nickname, phone, email, gender);
        return Result.ok("更新成功");
    }

    /** 更新头像 */
    @PutMapping("/avatar")
    public Result<?> updateAvatar(@RequestBody Map<String, String> params) {
        Long userId = getCurrentUserId();
        userService.updateAvatar(userId, params.get("avatar"));
        return Result.ok("头像更新成功");
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
