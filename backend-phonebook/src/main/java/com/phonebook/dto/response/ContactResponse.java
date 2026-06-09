package com.phonebook.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 联系人响应数据
 */
@Data
public class ContactResponse {

    private Long id;
    private String name;
    private String phoneticName;
    private String phone;
    private String secondPhone;
    private String email;
    private String secondEmail;
    private String address;
    private LocalDate birthday;
    private String company;
    private String position;
    private String website;
    private String remark;
    private Integer isFavorite;
    private String avatar;
    private List<GroupSimple> groups;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    /** 分组简要信息 */
    @Data
    public static class GroupSimple {
        private Long id;
        private String name;
        private String color;
    }
}
