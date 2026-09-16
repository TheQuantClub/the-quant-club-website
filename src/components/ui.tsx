import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "subtle" }) {
  return <button className={`button button--${variant} ${className}`} {...props} />;
}

export function Badge({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "neutral" | "warning" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`panel ${className}`} {...props} />;
}

export function PageHeading({ eyebrow, title, children, action }: { eyebrow: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-heading__copy">{children}</p></div>
      {action}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><h2>{title}</h2><p>{children}</p></div>;
}

export function DataNotice() {
  return (
    <div className="data-notice">
      <span><strong>Research prototype / synthetic backtest data.</strong> Holdings and performance figures are fabricated for interface testing.</span>
      <span className="certification">CA certificate: not supplied</span>
    </div>
  );
}
