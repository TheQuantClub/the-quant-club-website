"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { strategies, type Strategy } from "@/lib/data";
import { Badge, EmptyState, PageHeading } from "../ui";

function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <article className="strategy-card">
      <div className="strategy-card__top"><div className="strategy-symbol">Q</div><Badge>Licensed · All series</Badge></div>
      <p className="strategy-prefix">{strategy.type} · {strategy.category}</p>
      <h2>{strategy.name}</h2>
      <p className="strategy-copy">{strategy.lead}</p>
      <div className="strategy-meta"><span><ShieldCheck size={14} />{strategy.count} equal-weight holdings</span><span><CalendarClock size={14} />Six-month rebalance</span></div>
      <Link href={`/strategy/${strategy.id}/overview`} className="card-link">Open strategy <ArrowRight size={16} /></Link>
    </article>
  );
}

export function StrategiesScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(() => strategies.filter((strategy) => {
    const filterMatch = filter === "All" || strategy.type === filter;
    const searchMatch = `${strategy.name} ${strategy.category} ${strategy.universe}`.toLowerCase().includes(query.toLowerCase());
    return filterMatch && searchMatch;
  }), [query, filter]);
  return (
    <>
      <PageHeading eyebrow="Licensed research" title="Your strategies">Six systematic model portfolios, licensed to your firm with access to every analysis series.</PageHeading>
      <section className="publication-banner"><div><p className="eyebrow">September 2027 · Published</p><h2>The latest monthly portfolio batch is ready.</h2><p>Six strategy portfolios were released together on 1 September at 11:45 AM IST.</p></div><Link href="/publications" className="button button--light">View publication <ArrowRight size={15} /></Link></section>
      <div className="toolbar"><div className="filters">{["All", "Equity", "Mutual funds"].map((item) => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search strategies" /></label></div>
      <div className="strategy-grid">{filtered.length ? filtered.map((strategy) => <StrategyCard key={strategy.id} strategy={strategy} />) : <EmptyState title="No strategies found">Try another search or clear the selected filter.</EmptyState>}</div>
      <div className="screen-footnote"><span>All V1 strategies are equally weighted.</span><span>New monthly portfolios publish on the first calendar day by 12 PM IST.</span></div>
    </>
  );
}
