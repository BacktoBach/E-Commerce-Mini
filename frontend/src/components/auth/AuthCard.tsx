import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthCardProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}

export function AuthCard({ eyebrow, title, description, footer, children }: AuthCardProps) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <Link className="brand-link" to="/" aria-label="Về trang chủ NightFood">
        NightFood
      </Link>
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="auth-title">{title}</h1>
      <p className="auth-description">{description}</p>
      {children}
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </section>
  );
}
