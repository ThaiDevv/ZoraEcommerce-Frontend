# Commit Message Convention

Mọi commit trong dự án BẮT BUỘC phải tuân thủ nghiêm ngặt định dạng sau:

## Format
```
[TYPE] Short description
```

## Types:
- [FEAT]    : Tính năng mới
- [FIX]     : Sửa lỗi
- [UI]      : Thay đổi giao diện
- [REFACTOR]: Tái cấu trúc code
- [TEST]    : Thêm/sửa test
- [DOCS]    : Tài liệu
- [CHORE]   : Config, build, dependencies

## Ví dụ:
- [FEAT] Add create task with validation
- [FIX] Fix alarm not rescheduled after reboot
- [UI] Add empty state for task list
- [TEST] Add unit tests for TaskRepository
- [REFACTOR] Optimize order calculation service
- [DOCS] Update API documentation for payment flow
- [CHORE] Upgrade dependencies and build settings

## Quy tắc áp dụng:
1. Luôn viết hoa phần thẻ loại trong ngoặc vuông: `[FEAT]`, `[FIX]`, `[UI]`, `[REFACTOR]`, `[TEST]`, `[DOCS]`, `[CHORE]`.
2. Có đúng một khoảng trắng sau thẻ loại: `[TYPE] <Short description>`.
3. Mô tả ngắn gọn, trực diện, bắt đầu bằng chữ hoa hoặc động từ hành động.
4. Tuyệt đối không sử dụng các định dạng khác (như `feat:`, `feat(...)`, `Fix:`, không có dấu ngoặc vuông,...).
