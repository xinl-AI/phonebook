-- ============================================================
-- 手机通讯录系统 - 数据库建表脚本
-- 数据库: phonebook
-- 字符集: utf8mb4
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS phonebook
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE phonebook;

-- ============================================================
-- 表1: user（用户表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名（登录账号）',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `gender` TINYINT DEFAULT 0 COMMENT '性别：0未知 1男 2女',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0禁用 1正常',
    `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色：user/admin',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 表2: contact（联系人表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '联系人ID',
    `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `phonetic_name` VARCHAR(100) DEFAULT NULL COMMENT '拼音（用于搜索排序）',
    `phone` VARCHAR(20) NOT NULL COMMENT '主电话号码',
    `second_phone` VARCHAR(20) DEFAULT NULL COMMENT '备用电话',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `second_email` VARCHAR(100) DEFAULT NULL COMMENT '备用邮箱',
    `address` VARCHAR(200) DEFAULT NULL COMMENT '地址',
    `birthday` DATE DEFAULT NULL COMMENT '生日',
    `company` VARCHAR(100) DEFAULT NULL COMMENT '公司',
    `position` VARCHAR(50) DEFAULT NULL COMMENT '职位',
    `website` VARCHAR(200) DEFAULT NULL COMMENT '个人网站',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `is_favorite` TINYINT DEFAULT 0 COMMENT '是否收藏：0否 1是',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '软删除：0未删除 1已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_name` (`name`),
    KEY `idx_phone` (`phone`),
    KEY `idx_is_deleted` (`is_deleted`),
    CONSTRAINT `fk_contact_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联系人表';

-- ============================================================
-- 表3: `group`（分组表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分组ID',
    `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分组名称',
    `color` VARCHAR(10) DEFAULT '#07C160' COMMENT '分组颜色',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '分组图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',
    `contact_count` INT DEFAULT 0 COMMENT '联系人数（冗余字段）',
    `is_system` TINYINT DEFAULT 0 COMMENT '是否系统预设分组：0否 1是',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_group_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分组表';

-- ============================================================
-- 表4: contact_group（联系人-分组关联表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '关联ID',
    `contact_id` BIGINT NOT NULL COMMENT '联系人ID',
    `group_id` BIGINT NOT NULL COMMENT '分组ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '关联时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_contact_group` (`contact_id`, `group_id`),
    KEY `idx_contact_id` (`contact_id`),
    KEY `idx_group_id` (`group_id`),
    CONSTRAINT `fk_cg_contact` FOREIGN KEY (`contact_id`) REFERENCES `contact` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cg_group` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联系人-分组关联表';

-- ============================================================
-- 表5: call_log（通话记录表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `call_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
    `contact_id` BIGINT DEFAULT NULL COMMENT '联系人ID',
    `phone` VARCHAR(20) NOT NULL COMMENT '电话号码',
    `type` TINYINT NOT NULL COMMENT '类型：1呼出 2呼入 3未接',
    `duration` INT DEFAULT 0 COMMENT '通话时长（秒）',
    `call_time` DATETIME NOT NULL COMMENT '通话时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_contact_id` (`contact_id`),
    CONSTRAINT `fk_call_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通话记录表';

-- ============================================================
-- 表6: sms_log（短信记录表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `sms_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
    `contact_id` BIGINT DEFAULT NULL COMMENT '联系人ID',
    `phone` VARCHAR(20) NOT NULL COMMENT '电话号码',
    `content` VARCHAR(2000) DEFAULT NULL COMMENT '短信内容',
    `type` TINYINT NOT NULL COMMENT '类型：1发送 2接收',
    `send_time` DATETIME NOT NULL COMMENT '发送/接收时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_contact_id` (`contact_id`),
    CONSTRAINT `fk_sms_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信记录表';
