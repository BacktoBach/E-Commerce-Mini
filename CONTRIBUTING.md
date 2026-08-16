# Quy ước đóng góp NightFood

## Branch

Tạo branch từ `main` và đặt tên theo dạng `<type>/<short-description>`:

- `feat/authentication`
- `fix/refresh-token-expiry`
- `chore/update-dependencies`
- `refactor/order-service`
- `docs/api-integration`
- `test/auth-service`

Không đưa mã đang phát triển trực tiếp lên `main`.

## Commit

Dự án sử dụng Conventional Commits:

```text
<type>(<scope>): <description>
```

Các type được dùng:

- `feat`: thêm chức năng mới.
- `fix`: sửa lỗi.
- `chore`: cấu hình, dependency hoặc công việc bảo trì không đổi nghiệp vụ.
- `refactor`: thay đổi cấu trúc nhưng không thêm chức năng hay sửa lỗi.
- `test`: thêm hoặc chỉnh kiểm thử.
- `docs`: thay đổi tài liệu.
- `build`: thay đổi build system hoặc package.
- `ci`: thay đổi pipeline CI/CD.
- `perf`: cải thiện hiệu năng.

Scope nên ngắn và biểu thị khu vực bị tác động, ví dụ `auth`, `frontend`, `backend`, `database`,
`address`, `delivery`, `order`.

Ví dụ:

```text
feat(auth): add email and password login
fix(delivery): handle route provider timeout
chore(database): update Prisma migration scripts
refactor(frontend): separate Redux store from API services
test(auth): cover expired refresh token
docs: document local development setup
```

Thay đổi phá vỡ tương thích phải có dấu `!` và phần `BREAKING CHANGE` nếu cần:

```text
feat(api)!: change success response envelope
```

## Trước khi commit hoặc tạo pull request

1. Không commit `.env`, token, API key, database password hoặc file log.
2. Chạy `pnpm check` và bảo đảm format, lint, typecheck, test, build đều pass.
3. Giữ commit tập trung vào một mục đích; không trộn feature, fix và refactor không liên quan.
4. Cập nhật migration, `.env.example`, test và tài liệu khi thay đổi contract tương ứng.
