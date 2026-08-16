# NightFood

Website đặt món và giao đồ ăn đêm tại Đà Nẵng.

## Cấu trúc dự án

```text
E-Commerce Mini/
|-- backend/                 # Fastify + Prisma + Supabase PostgreSQL
|   |-- prisma/              # Schema và migrations
|   |-- src/
|   |   |-- routes/          # Khai báo endpoint
|   |   |-- controllers/     # Nhận request, trả response
|   |   |-- services/        # Xử lý nghiệp vụ và gọi Prisma
|   |   |-- schemas/         # Request/response schema
|   |   |-- middlewares/     # Middleware và error handler
|   |   |-- config/          # Env và Prisma
|   |   `-- utils/
|   `-- tests/
|-- frontend/                # React + Redux Toolkit
|   |-- index.html           # HTML shell bắt buộc của Vite
|   `-- src/
|       |-- layouts/         # Khung giao diện dùng chung
|       |-- pages/           # Các trang gắn với URL
|       |-- providers/       # Global providers của React
|       |-- redux/
|       |   |-- hooks.ts     # Typed Redux hooks
|       |   `-- store.ts     # Redux store và middleware
|       |-- routes/          # Khai báo React Router
|       |-- services/        # Axios dùng chung và API theo nghiệp vụ
|       |   |-- api.ts       # Axios client + RTK Query base API
|       |   `-- healthService.ts
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

Frontend dùng Redux Toolkit. Các request đến backend được quản lý bằng RTK Query,
không gọi trực tiếp bảng Supabase từ trình duyệt.

```text
Page -> RTK Query hook -> feature service -> api.ts (Axios) -> NightFood backend
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
ACCESS_TOKEN_SECRET=replace_with_at_least_32_random_characters
REFRESH_TOKEN_PEPPER=replace_with_at_least_32_random_characters
CORS_ORIGINS=http://localhost:5173
```

Frontend dùng file `frontend/.env` nếu cần thay URL backend:

```env
VITE_API_URL=http://localhost:5000
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

- `users`
- `auth_accounts`
- `sessions`
- `addresses`
- `_prisma_migrations`

RLS đã được bật trong Supabase. Frontend không được giữ database password, service-role
key hoặc kết nối trực tiếp PostgreSQL.

Khi có migration mới:

```bash
pnpm db:deploy
```

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
