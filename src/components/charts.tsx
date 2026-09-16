import type { ReactNode } from "react";

type ChartLine = { name: string; color: string; values: number[]; dashed?: boolean };

export function LineChart({ lines, height = 280, format = "index" }: { lines: ChartLine[]; height?: number; format?: "index" | "percent" }) {
  const width = 960, left = 48, right = 16, top = 12, bottom = 34;
  const all = lines.flatMap((line) => line.values).filter(Number.isFinite);
  if (!all.length) return <div className="chart-empty">Insufficient observations</div>;
  let low = Math.min(...all), high = Math.max(...all);
  if (format === "percent") { low = Math.min(low, 0); high = Math.max(high, 0); }
  const padding = (high - low || 1) * .12;
  low -= padding; high += padding;
  const maxLength = Math.max(...lines.map((line) => line.values.length));
  const x = (index: number) => left + index / Math.max(1, maxLength - 1) * (width - left - right);
  const y = (value: number) => height - bottom - (value - low) / (high - low) * (height - top - bottom);
  return (
    <div>
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Synthetic strategy and benchmark performance chart">
        {Array.from({ length: 5 }, (_, index) => {
          const value = low + (high - low) * index / 4;
          return <g key={index}><line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#E3E9F0" /><text x={left - 8} y={y(value) + 4} textAnchor="end" fontSize="11" fill="#60748B">{value.toFixed(0)}{format === "percent" ? "%" : ""}</text></g>;
        })}
        {lines.map((line) => {
          const d = line.values.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(" ");
          return <path key={line.name} d={d} fill="none" stroke={line.color} strokeWidth="2.5" strokeDasharray={line.dashed ? "7 6" : undefined} />;
        })}
      </svg>
      <div className="chart-legend">{lines.map((line) => <span key={line.name}><i style={{ background: line.color }} />{line.name}</span>)}</div>
    </div>
  );
}

export function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export function SectionHeading({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="section-heading"><div><h2>{title}</h2><p>{children}</p></div>{action}</div>;
}
