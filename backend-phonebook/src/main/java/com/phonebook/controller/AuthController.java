package com.phonebook.controller;

import com.phonebook.dto.request.ChangePasswordRequest;
import com.phonebook.dto.request.LoginRequest;
import com.phonebook.dto.request.RegisterRequest;
import com.phonebook.service.AuthService;
import com.phonebook.utils.Result;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 认证控制器 - 处理注册、登录、密码修改等认证相关接口
 * 路径前缀: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 用户注册 */
    @PostMapping("/register")
    public Result<?> register(@Valid @RequestBody RegisterRequest request) {
        Long userId = authService.register(request);
        return Result.ok("注册成功", userId);
    }

    /** 用户登录 */
    @PostMapping("/login")
    public Result<?> login(@Valid @RequestBody LoginRequest request) {
        return Result.ok(authService.login(request));
    }

    /** 退出登录 */
    @PostMapping("/logout")
    public Result<?> logout() {
        Long userId = getCurrentUserId();
        authService.logout(userId);
        return Result.ok();
    }

    /** 获取当前登录用户信息 */
    @GetMapping("/me")
    public Result<?> me() {
        Long userId = getCurrentUserId();
        return Result.ok(authService.getCurrentUser(userId));
    }

    /** 修改密码 */
    @PutMapping("/password")
    public Result<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        authService.changePassword(userId, request);
        return Result.ok("密码修改成功");
    }

    /**
     * 从Security上下文中获取当前登录用户ID
     */
    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
