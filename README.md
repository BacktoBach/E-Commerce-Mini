# NightFood

Website đặt món và giao đồ ăn đêm tại Đà Nẵng.

## Cấu trúc dự án

```text
E-Commerce Mini/
|-- backend/                 # Fastify + Prisma + Supabase Auth/PostgreSQL
|   |-- prisma/              # Schema và migrations
|   |-- src/
|   |   |-- routes/          # Khai báo endpoint
|   |   |-- controllers/     # Nhận request, trả response
|   |   |-- services/        # Xử lý nghiệp vụ và gọi Prisma
|   |   |-- schemas/         # Request/response schema
|   |   |-- middlewares/     # Middleware và error handler
|   |   |-- config/          # Env, Prisma và Supabase Auth client
|   |   `-- utils/
|   `-- tests/
|-- frontend/                # React + Redux Toolkit
|   |-- index.html           # HTML shell bắt buộc của Vite
|   `-- src/
|       |-- layouts/         # Khung giao diện dùng chung
|       |-- pages/           # Các trang gắn với URL
|       |-- providers/       # Global providers của React
|       |-- redux/
|       |   |-- slices/      # Client state theo nghiệp vụ
|       |   |-- hooks.ts     # Typed Redux hooks
|       |   `-- store.ts     # Redux store và middleware
|       |-- routes/          # Khai báo React Router
|       |-- services/        # Axios dùng chung và API theo nghiệp vụ
|       |   |-- api.ts       # Axios client + RTK Query base API
|       |   |-- authService.ts
|       |   |-- profileService.ts
|       |   `-- supabaseClient.ts
|       |-- types/           # Kiểu response và kiểu dùng chung
|       |-- App.tsx          # Ghép providers và router
|       `-- main.tsx         # Gắn React vào index.html
|-- compose.yaml             # PostgreSQL local dự phòng
|-- package.json             # Lệnh chung cho toàn dự án
`-- pnpm-workspace.yaml
```

Backend giữ cấu trúc cơ bản:

```text
route -> controller -> service -> Prisma -> Supabase
```

Frontend dùng Redux Toolkit. Dữ liệu nghiệp vụ đi qua NightFood backend; frontend chỉ gọi trực tiếp
Supabase Auth cho đăng ký, đăng nhập, Google OAuth, khôi phục mật khẩu và quản lý phiên. Frontend không
truy cập trực tiếp các bảng `public` trong Supabase.

```text
Page -> feature service/RTK Query -> api.ts (Axios) -> NightFood backend
```

Luồng khởi động frontend theo cùng form với Group8:

```text
index.html -> main.tsx -> App.tsx -> AppProviders -> AppRoutes -> Layouts -> Pages
```

Quy ước mở rộng frontend:

- Redux store, typed hooks và client state đặt trong `redux/`.
- `services/api.ts` tạo Axios client dùng chung và cầu nối RTK Query.
- Mỗi nhóm API có một service riêng, ví dụ `authService.ts`, `restaurantService.ts`,
  `orderService.ts`; các service dùng lại cấu hình trong `api.ts`.
- Redux slice cho client state đặt trong `redux/slices/` khi bắt đầu có nhu cầu.
- Logic giao tiếp với backend hoặc dịch vụ bên ngoài đặt trong `services/`, không đặt trong `redux/`.
- Component dùng lại ở nhiều trang đặt trong `components/`; khung trang đặt trong `layouts/`.
- Code chỉ đại diện cho một URL đặt trong `pages/`; cấu hình điều hướng đặt trong `routes/`.
- Provider toàn cục đặt trong `providers/`; kiểu dữ liệu và hàm tiện ích dùng chung lần lượt đặt trong
  `types/` và `utils/` khi bắt đầu phát sinh nhu cầu.
- Không tạo sẵn thư mục rỗng. Thư mục mới chỉ được thêm khi có code thực tế.

Luồng xác thực:

```text
Email/Password hoặc Google -> Supabase Auth -> access token
                                         -> Axios Bearer token
                                         -> NightFood backend
                                         -> xác minh Supabase claims
                                         -> public.users (hồ sơ nghiệp vụ)
```

Access token do Supabase quản lý và không được sao chép vào Redux. Redux chỉ giữ trạng thái đăng nhập
và hồ sơ tối thiểu cần cho giao diện.

Khi thêm nghiệp vụ backend, giữ cùng tên xuyên qua từng layer, ví dụ:

```text
auth.routes.ts -> auth.controller.ts -> auth.service.ts -> Prisma
```

Quy ước backend:

- Route chỉ khai báo URL, schema, middleware và gọi controller.
- Controller chỉ đọc request, gọi service và tạo response; không truy cập Prisma trực tiếp.
- Service chứa nghiệp vụ, transaction và truy cập Prisma.
- Schema chịu trách nhiệm validate request/response; lỗi đi qua error handler dùng chung.
- Chỉ bổ sung repository khi có nhu cầu thực tế như thay nguồn dữ liệu hoặc tái sử dụng truy vấn phức tạp;
  không thêm repository mặc định cho mọi feature.
- Tên file dùng thống nhất `feature.routes.ts`, `feature.controller.ts`, `feature.service.ts`.

## Công nghệ đã chốt

### Backend

- Node.js 24, TypeScript
- Fastify
- Prisma ORM
- Supabase PostgreSQL
- Supabase Auth (Email/Password, Google OAuth, email confirmation, password recovery)
- Swagger/OpenAPI
- Vitest

### Frontend

- React 19, TypeScript
- Vite
- Redux Toolkit và RTK Query
- Axios
- React Redux
- React Router
- Vitest

## Biến môi trường

Backend dùng file `backend/.env`:

```env
DATABASE_URL=postgresql://prisma.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
CORS_ORIGINS=http://localhost:5173
```

Frontend dùng file `frontend/.env` nếu cần thay URL backend:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Hai file `.env` đều được gitignore. Chỉ commit các file `.env.example`.

## Chạy dự án

```bash
pnpm install
pnpm dev
```

Hoặc chạy riêng từng phần:

```bash
pnpm dev:backend
pnpm dev:frontend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/docs`
- Backend health: `http://localhost:5000/health/live`
- Backend + Supabase readiness: `http://localhost:5000/health/ready`

## Database

Supabase là database chính. Các bảng hiện có:

- `auth.users`: tài khoản, identity và session do Supabase Auth quản lý.
- `public.users`: hồ sơ và role nghiệp vụ NightFood; dùng cùng UUID với `auth.users`.
- `public.addresses`: sổ địa chỉ giao hàng.
- `_prisma_migrations`

Các bảng auth tự xây trước đây (`public.auth_accounts`, `public.sessions`) và cột
`public.users.password_hash` được migration Supabase Auth loại bỏ. Backend không lưu mật khẩu,
refresh token hoặc Google client secret.

RLS đã được bật trong Supabase. Frontend không được giữ database password, service-role
key hoặc kết nối trực tiếp PostgreSQL.

Khi có migration mới:

```bash
pnpm db:deploy
```

Chỉ chạy deploy migration sau khi đã kiểm tra backup/dữ liệu trên môi trường đích. Migration
`20260820000100_supabase_auth_foundation` có thao tác xóa hai bảng auth cũ.

PostgreSQL trong `compose.yaml` chỉ là phương án chạy local dự phòng, không cần khởi
động khi đang sử dụng Supabase.

## Kiểm tra chất lượng

```bash
pnpm check
```

Lệnh này kiểm tra format, lint, typecheck, test và production build cho cả backend lẫn
frontend.

## Quy trình Git

Branch naming và Conventional Commits được quy định trong [CONTRIBUTING.md](./CONTRIBUTING.md).
