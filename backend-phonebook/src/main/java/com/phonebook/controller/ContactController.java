package com.phonebook.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.phonebook.dto.request.ContactRequest;
import com.phonebook.dto.response.ContactResponse;
import com.phonebook.service.ContactService;
import com.phonebook.utils.Result;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 联系人控制器 - 处理联系人的CRUD、搜索、收藏等接口
 * 路径前缀: /api/contacts
 */
@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    /** 获取联系人列表（支持分页、分组筛选、关键词搜索） */
    @GetMapping
    public Result<?> list(@RequestParam(defaultValue = "1") Integer page,
                          @RequestParam(defaultValue = "20") Integer size,
                          @RequestParam(required = false) Long groupId,
                          @RequestParam(required = false) String keyword) {
        Long userId = getCurrentUserId();
        IPage<ContactResponse> result = contactService.listContacts(userId, page, size, groupId, keyword);
        return Result.ok(result);
    }

    /** 获取收藏的联系人 */
    @GetMapping("/favorite")
    public Result<?> favorites() {
        Long userId = getCurrentUserId();
        return Result.ok(contactService.getFavorites(userId));
    }

    /** 获取联系人详情 */
    @GetMapping("/{id}")
    public Result<?> detail(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return Result.ok(contactService.getContactById(userId, id));
    }

    /** 添加联系人 */
    @PostMapping
    public Result<?> add(@Valid @RequestBody ContactRequest request) {
        Long userId = getCurrentUserId();
        Long contactId = contactService.addContact(userId, request);
        return Result.ok("添加成功", contactId);
    }

    /** 编辑联系人 */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        Long userId = getCurrentUserId();
        contactService.updateContact(userId, id, request);
        return Result.ok("修改成功");
    }

    /** 删除联系人（软删除） */
    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        contactService.deleteContact(userId, id);
        return Result.ok("删除成功");
    }

    /** 批量删除联系人 */
    @DeleteMapping("/batch")
    public Result<?> batchDelete(@RequestBody List<Long> ids) {
        Long userId = getCurrentUserId();
        int count = contactService.batchDeleteContacts(userId, ids);
        return Result.ok("成功删除" + count + "个联系人");
    }

    /** 搜索联系人 */
    @GetMapping("/search")
    public Result<?> search(@RequestParam String keyword,
                            @RequestParam(required = false) Long groupId) {
        Long userId = getCurrentUserId();
        IPage<ContactResponse> result = contactService.listContacts(userId, 1, 50, groupId, keyword);
        return Result.ok(result.getRecords());
    }

    /** 切换收藏状态 */
    @PutMapping("/{id}/favorite")
    public Result<?> toggleFavorite(@PathVariable Long id, @RequestBody Boolean isFavorite) {
        Long userId = getCurrentUserId();
        contactService.toggleFavorite(userId, id, isFavorite);
        return Result.ok();
    }

    /** 获取回收站列表 */
    @GetMapping("/recycle")
    public Result<?> recycleList(@RequestParam(defaultValue = "1") Integer page,
                                  @RequestParam(defaultValue = "20") Integer size) {
        Long userId = getCurrentUserId();
        return Result.ok(contactService.getDeletedContacts(userId, page, size));
    }

    /** 恢复已删除的联系人 */
    @PutMapping("/{id}/restore")
    public Result<?> restore(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        contactService.restoreContact(userId, id);
        return Result.ok("恢复成功");
    }

    /** 永久删除联系人（物理删除） */
    @DeleteMapping("/{id}/permanent")
    public Result<?> permanentDelete(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        contactService.permanentDelete(userId, id);
        return Result.ok("已永久删除");
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
