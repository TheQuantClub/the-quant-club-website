import { months, researchEnd, strategies } from "@/lib/data";
import { Button, Field } from "./ui";

export type ResearchState = { strategyId: string; series: string; taxView: string; from: string; to: string };

export function ResearchControls({ value, onChange, includeStrategy = false }: { value: ResearchState; onChange: (next: ResearchState) => void; includeStrategy?: boolean }) {
  const change = (field: keyof ResearchState, next: string) => onChange({ ...value, [field]: next });
  const quickRange = (years: number | "all") => {
    if (years === "all") return onChange({ ...value, from: "2013-01-01", to: researchEnd });
    const date = new Date(`${researchEnd}T00:00:00Z`); date.setUTCFullYear(date.getUTCFullYear() - years);
    onChange({ ...value, from: date.toISOString().slice(0, 10), to: researchEnd });
  };
  return (
    <>
      <div className="research-controls">
        {includeStrategy && <Field label="Strategy"><select value={value.strategyId} onChange={(event) => change("strategyId", event.target.value)}>{strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.name}</option>)}</select></Field>}
        <Field label="Analysis series"><select value={value.series} onChange={(event) => change("series", event.target.value)}>{months.map((month, index) => <option key={month} value={index}>{month}{index === 0 ? " — default" : ""}</option>)}<option value="composite">Composite average</option></select></Field>
        <Field label="Tax view"><select value={value.taxView} onChange={(event) => change("taxView", event.target.value)}><option value="pre">Pre-tax</option><option value="post">Post-tax illustration</option></select></Field>
        <Field label="From"><input type="date" min="2013-01-01" max={researchEnd} value={value.from} onChange={(event) => change("from", event.target.value)} /></Field>
        <Field label="To"><input type="date" min="2013-01-01" max={researchEnd} value={value.to} onChange={(event) => change("to", event.target.value)} /></Field>
        <Button type="button">Apply dates</Button>
      </div>
      <div className="quick-ranges"><span>Quick range</span>{[1, 3, 5].map((year) => <button key={year} onClick={() => quickRange(year)}>{year}Y</button>)}<button onClick={() => quickRange("all")}>All</button><span>Dates update every metric and chart on this page.</span></div>
    </>
  );
}
