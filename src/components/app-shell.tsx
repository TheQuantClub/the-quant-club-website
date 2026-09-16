"use client";

import Link from "next/link";
import { BarChart3, BookOpenText, Download, LayoutGrid, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { QuantLogo } from "./logo";

const links = [
  { href: "/strategies", label: "Your strategies", icon: LayoutGrid },
  { href: "/analytics/large-cap", label: "Analytics", icon: BarChart3 },
  { href: "/publications", label: "Publications", icon: BookOpenText },
  { href: "/downloads", label: "Downloads", icon: Download },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = pathname.startsWith("/strategy/") ? "Your strategies / Strategy" : pathname.startsWith("/analytics") ? "Workspace / Analytics" : pathname === "/publications" ? "Workspace / Publications" : pathname === "/downloads" ? "Workspace / Downloads" : "Workspace / Your strategies";
  return (
    <div className="app-shell">
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <Link href="/strategies" className="brand" onClick={() => setOpen(false)}><QuantLogo inverse /></Link>
        <div className="firm-card"><div className="avatar">DA</div><div><strong>Demo Advisory</strong><span>RIA workspace · sample firm</span></div></div>
        <p className="nav-label">Research workspace</p>
        <nav>{links.map(({ href, label, icon: Icon }) => {
          const active = href === "/strategies" ? pathname === "/strategies" || pathname.startsWith("/strategy/") : pathname.startsWith(href.split("/large-cap")[0]);
          return <Link key={href} href={href} className={active ? "nav-link nav-link--active" : "nav-link"} onClick={() => setOpen(false)}><Icon size={17} />{label}</Link>;
        })}</nav>
        <div className="sidebar-footer"><strong>A research workspace for your firm.</strong><span>No client records or execution tools in v1.</span><small>THE QUANT CLUB / V1</small></div>
      </aside>
      <main className="workspace">
        <header className="topbar"><span>{title}</span><div className="user"><span>Firm administrator</span><div className="avatar">DA</div></div></header>
        <div className="prototype-bar"><span>Design prototype · All portfolios and figures are demo data</span><span>Fictional workspace · September 2027</span></div>
        <div className="workspace-content">{children}<footer><span>The Quant Club · Research for investment professionals</span><span>Next.js frontend · Backend-ready V1</span></footer></div>
      </main>
    </div>
  );
}
