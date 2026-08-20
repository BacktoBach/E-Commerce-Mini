# Supabase Auth OTP cho NightFood

NightFood dùng email/password và Google OAuth. Email xác thực đăng ký và khôi phục mật khẩu dùng
mã OTP 6 số để tránh confirmation link bị email scanner sử dụng trước người dùng.

## 1. Confirm signup template

Vào Supabase Dashboard → Authentication → Emails → Templates → Confirm signup.

Subject:

```text
{{ .Token }} là mã xác thực NightFood
```

Body:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033">
  <h2 style="margin-bottom:8px">Xác thực tài khoản NightFood</h2>
  <p>Nhập mã sau tại màn hình xác thực để hoàn tất đăng ký:</p>
  <div
    style="margin:24px 0;padding:18px;border-radius:12px;background:#fff3e8;color:#c44d00;font-size:32px;font-weight:700;letter-spacing:10px;text-align:center"
  >
    {{ .Token }}
  </div>
  <p>Mã chỉ sử dụng một lần. Không chia sẻ mã này với người khác.</p>
  <p>Nếu bạn không tạo tài khoản NightFood, hãy bỏ qua email này.</p>
</div>
```

Không giữ `{{ .ConfirmationURL }}` trong template này.

## 2. Reset password template

Vào Supabase Dashboard → Authentication → Emails → Templates → Reset password.

Subject:

```text
{{ .Token }} là mã khôi phục mật khẩu NightFood
```

Body:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033">
  <h2 style="margin-bottom:8px">Khôi phục mật khẩu NightFood</h2>
  <p>Nhập mã sau tại màn hình khôi phục để đặt mật khẩu mới:</p>
  <div
    style="margin:24px 0;padding:18px;border-radius:12px;background:#fff3e8;color:#c44d00;font-size:32px;font-weight:700;letter-spacing:10px;text-align:center"
  >
    {{ .Token }}
  </div>
  <p>Mã chỉ sử dụng một lần. Không chia sẻ mã này với người khác.</p>
  <p>Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
</div>
```

Không giữ `{{ .ConfirmationURL }}` trong template này.

## 3. Auth settings

- Email/Password: bật.
- Confirm Email: bật.
- Google provider: bật.
- Email OTP expiration: khuyến nghị 600 giây cho đồ án; tối đa 900 giây nếu cần thêm thời gian.
- Cooldown gửi lại trên UI: 60 giây.
- SMTP: giữ Gmail SMTP hiện tại.

Callback Google vẫn là:

```text
https://ybokplprplgzvkwrojzh.supabase.co/auth/v1/callback
```

`/auth/callback` của frontend chỉ dùng cho Google OAuth. Signup và password recovery không còn phụ
thuộc vào clickable confirmation link.

## 4. Luồng frontend

```text
Đăng ký → /auth/verify-email → verifyOtp(type=email) → /account
Quên mật khẩu → /auth/verify-recovery → verifyOtp(type=recovery)
               → /auth/reset-password → updateUser(password) → đăng xuất
Google OAuth → /auth/callback → /account
```

Email đang chờ xác thực được giữ tạm trong `sessionStorage`. OTP không được lưu vào Redux,
`localStorage`, database hoặc log.

## 5. Checklist kiểm thử

- Đăng ký nhận đúng email có 6 số và không có confirmation link.
- Nhập đúng OTP tạo session và tạo `public.users` khi gọi `/api/v1/auth/me`.
- Nhập thiếu/sai OTP hiển thị lỗi tiếng Việt.
- Gửi lại bị khóa 60 giây; mã mới làm mã cũ hết hiệu lực.
- Quên mật khẩu nhận OTP, xác thực xong mới mở form đặt mật khẩu.
- Sau khi đổi mật khẩu, phiên bị đăng xuất; mật khẩu cũ thất bại và mật khẩu mới thành công.
- Google OAuth vẫn đăng nhập và quay về `/auth/callback` bình thường.
