"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateMetrics, formatNumber, formatPercent, generatePath, selectPeriod } from "@/lib/analytics";
import { historicalHoldings, months, researchEnd, strategyById } from "@/lib/data";
import { LineChart, MetricCard, SectionHeading } from "../charts";
import { ResearchControls, type ResearchState } from "../research-controls";
import { Badge, Button, DataNotice, Panel } from "../ui";

function downloadFile(name: string, content: string, type = "text/csv;charset=utf-8") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff", content], { type }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function StrategyHeader({ strategyId, section }: { strategyId: string; section: string }) {
  const strategy = strategyById(strategyId);
  const tabs = [["overview", "Overview"], ["performance", "Performance"], ["portfolio", "Historical portfolios"], ["documents", "Documents"]];
  return (
    <>
      <Link href="/strategies" className="back-link"><ArrowLeft size={14} />Back to your strategies</Link>
      <div className="detail-heading"><div><p className="eyebrow">{strategy.type} / Systematic research</p><h1>{strategy.name}</h1><p>{strategy.lead}</p></div><Badge>Licensed · All series</Badge></div>
      <nav className="tabs">{tabs.map(([id, label]) => <Link key={id} href={`/strategy/${strategy.id}/${id}`} aria-current={section === id ? "page" : undefined}>{label}</Link>)}<Link className="tabs__analytics" href={`/analytics/${strategy.id}`}>Full analytics <ArrowRight size={14} /></Link></nav>
    </>
  );
}

function Overview({ strategyId }: { strategyId: string }) {
  const strategy = strategyById(strategyId);
  return (
    <div className="overview-grid">
      <Panel><div className="notice"><strong>V1 methodology presentation</strong> · Detailed proprietary rules will connect from the approved research documentation.</div><h2>How the strategy works</h2>
        {[['01','Define the universe',`Start with ${strategy.universe.toLowerCase()} that satisfy the strategy’s approved eligibility rules.`],['02','Rank the eligible set','Apply repeatable quantitative signals and documented selection rules.'],['03','Build equal weights',`Allocate the selected ${strategy.count} holdings equally at each scheduled rebalance.`],['04','Publish monthly','Release a dated portfolio on the first calendar day by 12 PM IST for firms deploying at different times.']].map(([number,title,body]) => <div className="method-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}
      </Panel>
      <div className="overview-aside"><Panel><h2>Strategy facts</h2><dl className="facts"><div><dt>Universe</dt><dd>{strategy.universe}</dd></div><div><dt>Holdings</dt><dd>{strategy.count}</dd></div><div><dt>Weighting</dt><dd>Equal weight</dd></div><div><dt>Rebalance cycle</dt><dd>Six months</dd></div><div><dt>Analysis access</dt><dd>All 12 start series + composite</dd></div><div><dt>Benchmark</dt><dd>{strategy.benchmark}</dd></div></dl></Panel>
        <Panel className="risk-panel"><ShieldAlert size={19} /><h3>Risk considerations</h3><p>{strategy.risk}</p></Panel>
        <div className="next-step"><p className="eyebrow">Next</p><h3>See how it has behaved</h3><p>Explore the strategy path, benchmark and selected-period measures.</p><Link className="button button--primary" href={`/strategy/${strategy.id}/performance`}>Open performance <ArrowRight size={15} /></Link></div>
      </div>
    </div>
  );
}

function Performance({ strategyId }: { strategyId: string }) {
  const strategy = strategyById(strategyId);
  const [research, setResearch] = useState<ResearchState>({ strategyId, series: "0", taxView: "pre", from: "2013-01-01", to: researchEnd });
  const points = useMemo(() => selectPeriod(generatePath(strategy, research.series, research.taxView), research.from, research.to), [strategy, research]);
  const metrics = useMemo(() => calculateMetrics(points), [points]);
  const strategyLine = points.length ? points.map((point) => point.value / points[0].value * 100) : [];
  const benchmarkLine = points.length ? points.map((point) => point.benchmark / points[0].benchmark * 100) : [];
  const exportNav = () => downloadFile(`${strategy.id}-selected-nav-DEMO.csv`, [["Classification","SYNTHETIC DEMO"],["Strategy",strategy.name],["Date","Strategy NAV","Benchmark NAV"],...points.map((point) => [point.date, point.value.toFixed(8), point.benchmark.toFixed(8)])].map((row) => row.join(",")).join("\n"));
  return <><DataNotice /><ResearchControls value={research} onChange={setResearch} />{!metrics ? <Panel><h2>Choose an available period</h2><p>The selected range needs at least two observations.</p></Panel> : <>
    <div className="metric-grid"><MetricCard label="Annualised return" value={formatPercent(metrics.cagr)} note="CAGR · selected period" /><MetricCard label="Benchmark return" value={formatPercent(metrics.benchmarkCagr)} note={strategy.benchmark} /><MetricCard label="Maximum drawdown" value={formatPercent(metrics.maxDrawdown)} note="Peak-to-trough" /><MetricCard label="Sharpe ratio" value={formatNumber(metrics.sharpe)} note="6.5% illustrative risk-free rate" /></div>
    <Panel className="chart-panel"><SectionHeading title="Growth over your selected period" action={<Button variant="secondary" onClick={exportNav}><Download size={14} />Download NAV</Button>}>Strategy and benchmark rebased to 100 at the first available date.</SectionHeading><LineChart lines={[{ name: strategy.shortName, color: "#2563EB", values: strategyLine }, { name: strategy.benchmark, color: "#8192A8", values: benchmarkLine, dashed: true }]} /><div className="chart-readout"><span>{points[0].date}</span><span>{points.at(-1)!.date}</span><span>{metrics.observations.toLocaleString()} weekday observations</span></div><div className="journey"><div><h3>Look beyond the headline</h3><p>Explore risk ratios, rolling outcomes, drawdowns and market conditions.</p></div><Link href={`/analytics/${strategy.id}`} className="button button--primary">Open full analytics <ArrowRight size={15} /></Link></div></Panel>
  </>}</>;
}

function Portfolio({ strategyId }: { strategyId: string }) {
  const strategy = strategyById(strategyId);
  const [year, setYear] = useState(2027), [month, setMonth] = useState(8);
  const holdings = historicalHoldings(strategy, year, month);
  const next = new Date(Date.UTC(year, month + 6, 1));
  const shift = (amount: number) => { const value = new Date(Date.UTC(year, month + amount, 1)); if (value < new Date(Date.UTC(2013, 0, 1)) || value > new Date(Date.UTC(2027, 8, 1))) return; setYear(value.getUTCFullYear()); setMonth(value.getUTCMonth()); };
  const exportPortfolio = () => downloadFile(`${strategy.id}-${year}-${String(month + 1).padStart(2,"0")}-holdings-DEMO.csv`, [["Classification","SYNTHETIC HOLDINGS"],["Strategy",strategy.name],["Portfolio month",`${months[month]} ${year}`],["Holding","Identifier","Target weight percent","Change"],...holdings.map((holding) => [holding.name,holding.code,holding.weight.toFixed(8),holding.change])].map((row) => row.join(",")).join("\n"));
  return <><DataNotice /><Panel><div className="section-heading"><div><h2>{months[month]} {year} portfolio</h2><p>Explore the model holdings for any month in the available demo history.</p></div><Button onClick={exportPortfolio}><Download size={14} />Download this portfolio</Button></div>
    <div className="archive-toolbar"><label>Year<select value={year} onChange={(event) => setYear(Number(event.target.value))}>{Array.from({length:15},(_,index)=>2027-index).map((value)=><option key={value}>{value}</option>)}</select></label><label>Month<select value={month} onChange={(event)=>setMonth(Number(event.target.value))}>{months.map((value,index)=><option key={value} value={index} disabled={year===2027&&index>8}>{value}</option>)}</select></label><div className="archive-nav"><button onClick={()=>shift(-1)}>←</button><button onClick={()=>shift(1)}>→</button><button onClick={()=>{setYear(2027);setMonth(8)}}>Latest</button></div><span>177 monthly records · Jan 2013–Sep 2027</span></div>
    <div className="month-timeline">{months.map((value,index)=><button key={value} disabled={year===2027&&index>8} aria-pressed={month===index} onClick={()=>setMonth(index)}>{value.slice(0,3)}</button>)}</div>
    <div className="archive-summary"><div><small>Record type</small><strong>Synthetic historical portfolio</strong></div><div><small>Applicable from</small><strong>1 {months[month]} {year}</strong></div><div><small>Next rebalance</small><strong>{months[next.getUTCMonth()]} {next.getUTCFullYear()}</strong></div><div><small>Publication evidence</small><strong>No live publication claimed</strong></div></div>
    <div className="table-wrap"><table><thead><tr><th>Holding</th><th>Identifier</th><th>Change vs previous cycle</th><th>Target weight</th></tr></thead><tbody>{holdings.map((holding)=><tr key={holding.code}><td><strong>{holding.name}</strong></td><td className="mono">{holding.code}</td><td><Badge tone={holding.change==="Added"?"success":"neutral"}>{holding.change}</Badge></td><td>{holding.weight.toFixed(2)}%</td></tr>)}</tbody></table></div><p className="hint">Weights use full precision; displayed rounding may not total exactly 100%. Fictional identifiers are not exchange identifiers.</p>
  </Panel></>;
}

function Documents({ strategyId }: { strategyId: string }) {
  const strategy = strategyById(strategyId);
  const rows = [
    ["Methodology note","PDF · Updated 01 Sep 2027","Read the portfolio rules and rebalance process."],
    ["Latest portfolio","CSV · September 2027","Equal-weight holdings for current deployment."],
    ["Selected NAV history","CSV · Date-filtered","Strategy and benchmark data for the chosen period."],
    ["Analytics metrics","CSV · Date-filtered","Risk ratios with strategy and benchmark columns."],
  ];
  return <><div className="publishing-note"><RefreshCw size={18} /><div><strong>Monthly publication window</strong><span>The latest portfolio is released on the first calendar day by 12 PM IST.</span></div></div><div className="document-list">{rows.map(([title,meta,copy])=><article className="document-row" key={title}><div className="file-icon"><FileText size={18} /></div><div><h3>{title}</h3><p>{copy}</p></div><span>{meta}</span><Button variant="secondary" onClick={()=>downloadFile(`${strategy.id}-${title.toLowerCase().replaceAll(" ","-")}-DEMO.txt`,`${strategy.name}\n${title}\n\nSynthetic demonstration file.`,"text/plain;charset=utf-8")}><Download size={14} />Download</Button></article>)}</div></>;
}

export function StrategyScreen({ strategyId, section }: { strategyId?: string; section: string }) {
  const strategy = strategyById(strategyId);
  const valid = ["overview","performance","portfolio","documents"].includes(section) ? section : "overview";
  return <><StrategyHeader strategyId={strategy.id} section={valid} />{valid === "overview" && <Overview strategyId={strategy.id} />}{valid === "performance" && <Performance strategyId={strategy.id} />}{valid === "portfolio" && <Portfolio strategyId={strategy.id} />}{valid === "documents" && <Documents strategyId={strategy.id} />}</>;
}
