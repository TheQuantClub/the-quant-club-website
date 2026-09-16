"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { benchmarkMetrics, calculateMetrics, drawdownSeries, formatNumber, formatPercent, generatePath, monthlyReturns, selectPeriod, type Metrics } from "@/lib/analytics";
import { researchEnd, strategies, strategyById } from "@/lib/data";
import { LineChart, MetricCard, SectionHeading } from "../charts";
import { ResearchControls, type ResearchState } from "../research-controls";
import { Button, DataNotice, PageHeading, Panel } from "../ui";

function csvDownload(name: string, rows: (string | number)[][]) {
  const content = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"','""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" })); link.download = name; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}

const ratioRows: [string, keyof Metrics, string][] = [
  ["Sharpe","sharpe","Excess return relative to overall volatility."],
  ["Sortino","sortino","Excess return relative to downside deviation."],
  ["Calmar","calmar","Annualised return relative to maximum drawdown."],
  ["Information ratio","informationRatio","Active return relative to tracking error."],
  ["Beta","beta","Sensitivity to the illustrative benchmark."],
  ["Alpha","alpha","Annualised arithmetic return unexplained by beta."],
  ["Correlation","correlation","Co-movement of daily strategy and benchmark returns."],
  ["Tracking error","trackingError","Annualised volatility of daily active returns."],
  ["Volatility","volatility","Annualised standard deviation of daily returns."],
  ["Downside deviation","downsideDeviation","Annualised shortfalls below the risk-free return."],
];

function renderMetric(key: keyof Metrics, value: number) {
  return ["alpha","trackingError","volatility","downsideDeviation"].includes(key) ? formatPercent(value) : formatNumber(value);
}

function rollingOutcomes(points: ReturnType<typeof selectPeriod>, years: number) {
  const monthly = points.filter((point,index) => !points[index+1] || points[index+1].date.slice(0,7)!==point.date.slice(0,7));
  const output:number[]=[];
  monthly.forEach((end) => { const target = new Date(`${end.date}T00:00:00Z`); target.setUTCFullYear(target.getUTCFullYear()-years); const start=monthly.find((point)=>point.date>=target.toISOString().slice(0,10)); if(start&&start.date<end.date){const duration=(Date.parse(end.date)-Date.parse(start.date))/86_400_000/365.25;output.push(((end.value/start.value)**(1/duration)-1)*100);} });
  return output;
}

function SingleAnalytics({ research }: { research: ResearchState }) {
  const strategy = strategyById(research.strategyId);
  const points = useMemo(()=>selectPeriod(generatePath(strategy,research.series,research.taxView),research.from,research.to),[strategy,research]);
  const metrics = useMemo(()=>calculateMetrics(points),[points]);
  const benchmark = useMemo(()=>benchmarkMetrics(points),[points]);
  const [rollingYears,setRollingYears]=useState(3);
  if(!metrics||!benchmark)return <Panel><h2>Choose an available period</h2><p>The selected dates need at least two observations.</p></Panel>;
  const strategyLine=points.map((point)=>point.value/points[0].value*100),benchmarkLine=points.map((point)=>point.benchmark/points[0].benchmark*100);
  const drawdowns=drawdownSeries(points).map((point)=>point.value);
  const rolling=rollingOutcomes(points,rollingYears);
  const sorted=[...rolling].sort((a,b)=>a-b),median=sorted.length?sorted[Math.floor(sorted.length/2)]:Number.NaN;
  const monthlies=monthlyReturns(points);
  const exportMetrics=()=>csvDownload(`${strategy.id}-analytics-DEMO.csv`,[["Classification","SYNTHETIC DEMO"],["Strategy",strategy.name],["Benchmark",strategy.benchmark],["Period",`${points[0].date} to ${points.at(-1)!.date}`],["Measure","Strategy","Benchmark","Definition"],...ratioRows.map(([label,key,definition])=>[label,renderMetric(key,metrics[key] as number),renderMetric(key,benchmark[key] as number),definition])]);
  return <>
    <div className="metric-grid"><MetricCard label="Annualised return" value={formatPercent(metrics.cagr)} note="CAGR · selected period"/><MetricCard label="Benchmark return" value={formatPercent(metrics.benchmarkCagr)} note={strategy.benchmark}/><MetricCard label="Maximum drawdown" value={formatPercent(metrics.maxDrawdown)} note="Peak-to-trough"/><MetricCard label="Sharpe ratio" value={formatNumber(metrics.sharpe)} note="6.5% illustrative risk-free rate"/></div>
    <nav className="analytics-jump"><a href="#growth">Growth</a><a href="#risk">Risk ratios</a><a href="#drawdowns">Drawdowns</a><a href="#rolling">Rolling returns</a><a href="#calendar">Calendar</a></nav>
    <Panel id="growth" className="research-section"><SectionHeading title="Growth of 100">Strategy and benchmark rebased at the first selected observation.</SectionHeading><LineChart lines={[{name:strategy.shortName,color:"#2563EB",values:strategyLine},{name:strategy.benchmark,color:"#8192A8",values:benchmarkLine,dashed:true}]}/></Panel>
    <Panel id="risk" className="research-section"><SectionHeading title="Return in the context of risk" action={<Button variant="secondary" onClick={exportMetrics}><Download size={14}/>Export metrics</Button>}>Every metric uses the selected strategy, series, tax view and period.</SectionHeading><div className="table-wrap"><table className="ratio-table"><thead><tr><th>Measure</th><th>Strategy</th><th>Benchmark</th><th>What it describes</th></tr></thead><tbody>{ratioRows.map(([label,key,definition])=><tr key={label}><td>{label}</td><td>{renderMetric(key,metrics[key] as number)}</td><td>{renderMetric(key,benchmark[key] as number)}</td><td>{definition}</td></tr>)}</tbody></table></div><p className="hint">Annualised daily statistics · 252 observations/year · 6.5% illustrative risk-free rate.</p></Panel>
    <div className="dual-panels"><Panel id="drawdowns" className="research-section"><SectionHeading title="Drawdown path">Decline from the running peak within the selected period.</SectionHeading><LineChart height={240} format="percent" lines={[{name:"Strategy drawdown",color:"#B6473A",values:drawdowns}]}/><div className="single-stat"><span>Maximum drawdown</span><strong>{formatPercent(metrics.maxDrawdown)}</strong></div></Panel><Panel className="research-section"><SectionHeading title="Market capture">How monthly strategy returns behaved when the benchmark rose or fell.</SectionHeading><div className="capture-grid"><div><span>Positive months</span><strong>{formatPercent(metrics.positiveMonths)}</strong></div><div><span>Active return</span><strong>{formatPercent(metrics.total-metrics.benchmarkTotal)}</strong></div></div><div className="inline-bars"><span><b style={{width:`${Math.min(100,metrics.positiveMonths)}%`}}/></span><span><b style={{width:`${Math.min(100,Math.abs(metrics.total-metrics.benchmarkTotal)*4)}%`}}/></span></div></Panel></div>
    <Panel id="rolling" className="research-section"><SectionHeading title="Rolling returns">Annualised outcomes from overlapping month-end windows.</SectionHeading><div className="rolling-controls">{[1,3,5,7].map((year)=><button key={year} aria-pressed={rollingYears===year} onClick={()=>setRollingYears(year)}>{year} year</button>)}</div><div className="metric-grid metric-grid--inside"><MetricCard label="Worst" value={formatPercent(Math.min(...rolling))} note="Annualised window return"/><MetricCard label="Median" value={formatPercent(median)} note="Middle outcome"/><MetricCard label="Best" value={formatPercent(Math.max(...rolling))} note="Annualised window return"/><MetricCard label="Positive" value={formatPercent(rolling.filter((value)=>value>0).length/Math.max(1,rolling.length)*100)} note={`${rolling.length} overlapping windows`}/></div><div className="histogram">{Array.from({length:12},(_,index)=>{const height=rolling.length?20+((index*37+rolling.length*11)%80):2;return <i key={index} style={{height:`${height}%`}}/>})}</div><p className="hint">Overlapping windows are not independent observations. This is not a probability forecast.</p></Panel>
    <Panel id="calendar" className="research-section"><SectionHeading title="Recent monthly returns">The latest strategy and benchmark month-end changes in the selected period.</SectionHeading><div className="table-wrap"><table><thead><tr><th>Month</th><th>Strategy</th><th>Benchmark</th><th>Difference</th></tr></thead><tbody>{monthlies.slice(-12).reverse().map((month)=><tr key={month.date}><td>{new Date(`${month.date}T00:00:00Z`).toLocaleDateString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"})}</td><td>{formatPercent(month.value*100)}</td><td>{formatPercent(month.benchmark*100)}</td><td>{formatPercent((month.value-month.benchmark)*100)}</td></tr>)}</tbody></table></div></Panel>
    <details className="methodology"><summary>Calculation methods and evidence</summary><p>All data is synthetic. Risk measures use daily returns and 252 observations per year. The composite averages twelve rebased start-month series. The post-tax view applies an illustrative periodic deduction and is not a statutory tax model.</p></details>
  </>;
}

function Comparison({ research, selected, setSelected }: { research: ResearchState; selected: string[]; setSelected: (ids:string[])=>void }) {
  const chosen=strategies.filter((strategy)=>selected.includes(strategy.id));
  const datasets=chosen.map((strategy)=>{const points=selectPeriod(generatePath(strategy,research.series,research.taxView),research.from,research.to);return{strategy,points,metrics:calculateMetrics(points)}}).filter((item)=>item.metrics);
  const colors=["#2563EB","#0B8D9D","#815DC5"];
  const toggle=(id:string)=>{if(selected.includes(id))setSelected(selected.filter((value)=>value!==id));else if(selected.length<3)setSelected([...selected,id]);};
  return <><p className="compare-intro">Choose two or three subscribed strategies. Dates, series and tax treatment are shared across the comparison.</p><div className="strategy-checks">{strategies.map((strategy)=><label key={strategy.id} className={selected.includes(strategy.id)?"selected":""}><input type="checkbox" checked={selected.includes(strategy.id)} onChange={()=>toggle(strategy.id)}/>{strategy.shortName}</label>)}</div>{datasets.length<2?<div className="empty-state"><h2>Select at least two strategies</h2><p>Use the choices above to build a common-period comparison.</p></div>:<><Panel className="research-section"><SectionHeading title="Compare the path, then the measures">Each selected strategy starts at 100 on its first selected observation.</SectionHeading><LineChart lines={datasets.map((item,index)=>({name:item.strategy.shortName,color:colors[index],values:item.points.map((point)=>point.value/item.points[0].value*100)}))}/><div className="table-wrap"><table className="compare-table"><thead><tr><th>Measure</th>{datasets.map((item)=><th key={item.strategy.id}>{item.strategy.shortName}</th>)}</tr></thead><tbody>{[["CAGR","cagr"],["Total return","total"],["Maximum drawdown","maxDrawdown"],["Volatility","volatility"],["Sharpe","sharpe"],["Sortino","sortino"],["Calmar","calmar"],["Information ratio","informationRatio"],["Alpha","alpha"],["Beta","beta"]].map(([label,key])=><tr key={label}><td>{label}</td>{datasets.map((item)=><td key={item.strategy.id}>{["sharpe","sortino","calmar","informationRatio","beta"].includes(key)?formatNumber(item.metrics![key as keyof Metrics] as number):formatPercent(item.metrics![key as keyof Metrics] as number)}</td>)}</tr>)}</tbody></table></div></Panel></>}</>;
}

export function AnalyticsScreen({ initialStrategyId }: { initialStrategyId?: string }) {
  const [mode,setMode]=useState<"single"|"compare">("single");
  const [research,setResearch]=useState<ResearchState>({strategyId:strategyById(initialStrategyId).id,series:"0",taxView:"pre",from:"2013-01-01",to:researchEnd});
  const [selected,setSelected]=useState(["large-cap","mid-cap"]);
  return <><PageHeading eyebrow="Research / Analytics" title="A deeper view of the strategy." action={<Link href={`/strategy/${research.strategyId}/performance`} className="button button--secondary">Back to performance</Link>}>Explore returns, risk and consistency across time. Carry the same assumptions through every view.</PageHeading><div className="workspace-mode"><button aria-pressed={mode==="single"} onClick={()=>setMode("single")}>Single strategy</button><button aria-pressed={mode==="compare"} onClick={()=>setMode("compare")}>Compare strategies</button></div><DataNotice/><ResearchControls value={research} onChange={setResearch} includeStrategy={mode==="single"}/>{mode==="single"?<SingleAnalytics research={research}/>:<Comparison research={research} selected={selected} setSelected={setSelected}/>}</>;
}
