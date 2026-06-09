package com.phonebook.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分组响应数据
 */
@Data
public class GroupResponse {

    private Long id;
    private String name;
    private String color;
    private String icon;
    private Integer sortOrder;
    private Integer contactCount;
    private Integer isSystem;
    private LocalDateTime createTime;
}
