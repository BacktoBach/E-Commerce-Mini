import { useGetApiHealthQuery } from "../services/healthService";

function connectionText(isLoading: boolean, isConnected: boolean): string {
  if (isLoading) return "Đang kết nối backend...";
  if (isConnected) return "Backend đã kết nối";
  return "Chưa kết nối được backend";
}

export default function Home() {
  const { data, isLoading } = useGetApiHealthQuery(undefined);
  const isConnected = data?.data.service === "up";

  return (
    <section className="foundation-card" aria-labelledby="page-title">
      <p className="eyebrow">ĐÀ NẴNG · FOOD DELIVERY</p>
      <h1 id="page-title">NightFood</h1>
      <p className="description">
        Nền tảng đặt món ăn đêm đang được xây dựng. Frontend sử dụng React và Redux Toolkit; backend
        sử dụng Fastify, Prisma và Supabase PostgreSQL.
      </p>
      <div className={isConnected ? "status status--online" : "status"} role="status">
        <span className="status__dot" aria-hidden="true" />
        {connectionText(isLoading, isConnected)}
      </div>
    </section>
  );
}
