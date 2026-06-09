package com.phonebook.controller;

import com.phonebook.dto.request.GroupRequest;
import com.phonebook.service.GroupService;
import com.phonebook.utils.Result;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 分组控制器 - 处理分组的CRUD、移动联系人等接口
 * 路径前缀: /api/groups
 */
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    /** 获取所有分组 */
    @GetMapping
    public Result<?> list() {
        Long userId = getCurrentUserId();
        return Result.ok(groupService.listGroups(userId));
    }

    /** 创建分组 */
    @PostMapping
    public Result<?> create(@Valid @RequestBody GroupRequest request) {
        Long userId = getCurrentUserId();
        Long groupId = groupService.createGroup(userId, request);
        return Result.ok("创建成功", groupId);
    }

    /** 编辑分组 */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @Valid @RequestBody GroupRequest request) {
        Long userId = getCurrentUserId();
        groupService.updateGroup(userId, id, request);
        return Result.ok("修改成功");
    }

    /** 删除分组 */
    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id,
                            @RequestParam(required = false) Long moveToId) {
        Long userId = getCurrentUserId();
        groupService.deleteGroup(userId, id, moveToId);
        return Result.ok("删除成功");
    }

    /** 获取分组下的联系人 */
    @GetMapping("/{id}/contacts")
    public Result<?> getContacts(@PathVariable Long id,
                                  @RequestParam(defaultValue = "1") Integer page,
                                  @RequestParam(defaultValue = "20") Integer size) {
        Long userId = getCurrentUserId();
        return Result.ok(groupService.getGroupContacts(userId, id, page, size));
    }

    /** 移动联系人到分组 */
    @PostMapping("/move")
    public Result<?> moveContacts(@RequestBody MoveContactsRequest request) {
        Long userId = getCurrentUserId();
        groupService.moveContacts(userId, request.getContactIds(), request.getGroupIds());
        return Result.ok("移动成功");
    }

    /** 调整分组排序 */
    @PutMapping("/sort")
    public Result<?> sort(@RequestBody List<Long> groupIds) {
        Long userId = getCurrentUserId();
        groupService.sortGroups(userId, groupIds);
        return Result.ok("排序完成");
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /**
     * 移动联系人请求体
     */
    public static class MoveContactsRequest {
        private List<Long> contactIds;
        private List<Long> groupIds;

        public List<Long> getContactIds() { return contactIds; }
        public void setContactIds(List<Long> contactIds) { this.contactIds = contactIds; }
        public List<Long> getGroupIds() { return groupIds; }
        public void setGroupIds(List<Long> groupIds) { this.groupIds = groupIds; }
    }
}
