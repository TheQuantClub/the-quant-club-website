import { months, researchEnd, type Strategy } from "./data";

export type Point = { date: string; value: number; benchmark: number };
export type Metrics = {
  observations: number; years: number; total: number; benchmarkTotal: number; cagr: number;
  benchmarkCagr: number; volatility: number; downsideDeviation: number; sharpe: number;
  sortino: number; calmar: number; beta: number; alpha: number; correlation: number;
  trackingError: number; informationRatio: number; maxDrawdown: number; positiveMonths: number;
};

const cache = new Map<string, Point[]>();
const DAY = 86_400_000;

const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.NaN;
const variance = (values: number[]) => {
  if (values.length < 2) return Number.NaN;
  const average = mean(values);
  return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
};
const deviation = (values: number[]) => Math.sqrt(variance(values));
const covariance = (a: number[], b: number[]) => {
  if (a.length < 2) return Number.NaN;
  const averageA = mean(a), averageB = mean(b);
  return a.reduce((sum, value, index) => sum + (value - averageA) * (b[index] - averageB), 0) / (a.length - 1);
};

export function generatePath(strategy: Strategy, series: string, taxView: string): Point[] {
  const key = `${strategy.id}|${series}|${taxView}`;
  const cached = cache.get(key);
  if (cached) return cached;
  if (series === "composite") {
    const paths = Array.from({ length: 12 }, (_, index) => generatePath(strategy, String(index), taxView));
    const start = Math.max(...paths.map((path) => Date.parse(path[0].date)));
    const aligned = paths.map((path) => path.filter((point) => Date.parse(point.date) >= start));
    const composite = aligned[0].map((point, index) => ({
      date: point.date,
      value: mean(aligned.map((path) => path[index].value / path[0].value * 100)),
      benchmark: mean(aligned.map((path) => path[index].benchmark / path[0].benchmark * 100)),
    }));
    cache.set(key, composite);
    return composite;
  }
  const month = Number(series), seed = strategiesSeed(strategy.id);
  const start = Date.UTC(2013, month, 1), end = Date.parse(researchEnd);
  let value = 100, benchmark = 100, previousMonth = -1;
  const output: Point[] = [];
  for (let time = start; time <= end; time += DAY) {
    const date = new Date(time);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) continue;
    if (output.length) {
      const n = Math.round((time - Date.UTC(2013, 0, 1)) / DAY);
      const market = .00031 + .0065 * Math.sin(n * 1.731) + .0044 * Math.cos(n * .731) + .0011 * Math.sin(n * .042);
      let shock = 0;
      if (time >= Date.UTC(2020, 1, 20) && time <= Date.UTC(2020, 2, 24)) shock = -.012;
      if (time >= Date.UTC(2022, 0, 1) && time <= Date.UTC(2022, 5, 30)) shock = -.0015;
      if (time >= Date.UTC(2015, 6, 1) && time <= Date.UTC(2016, 1, 29)) shock = -.0011;
      const dailyReturn = market * (.78 + seed * .055) + .0001 + .0027 * Math.sin(n * .337 + seed * 1.3 + month * .23) + shock * (.75 + seed * .07);
      benchmark *= 1 + market + shock;
      value *= 1 + dailyReturn;
      if (taxView === "post" && previousMonth !== date.getUTCMonth() && [0, 6].includes(date.getUTCMonth())) value *= .992;
    }
    output.push({ date: new Date(time).toISOString().slice(0, 10), value, benchmark });
    previousMonth = date.getUTCMonth();
  }
  cache.set(key, output);
  return output;
}

function strategiesSeed(id: string) {
  return ["large-cap", "mid-cap", "small-cap", "multi-cap", "diversified-mf", "sector-rotation"].indexOf(id) + 1;
}

export function selectPeriod(points: Point[], from: string, to: string) {
  return points.filter((point) => point.date >= from && point.date <= to);
}

export function drawdownSeries(points: Point[]) {
  let peak = points[0]?.value ?? 0;
  return points.map((point) => {
    peak = Math.max(peak, point.value);
    return { date: point.date, value: (point.value / peak - 1) * 100 };
  });
}

export function monthlyReturns(points: Point[]) {
  if (points.length < 2) return [];
  const result: { date: string; value: number; benchmark: number }[] = [];
  let previous = points[0];
  points.forEach((point, index) => {
    const next = points[index + 1];
    if (!next || next.date.slice(0, 7) !== point.date.slice(0, 7)) {
      result.push({ date: point.date, value: point.value / previous.value - 1, benchmark: point.benchmark / previous.benchmark - 1 });
      previous = point;
    }
  });
  return result;
}

export function calculateMetrics(points: Point[]): Metrics | null {
  if (points.length < 2) return null;
  const years = (Date.parse(points.at(-1)!.date) - Date.parse(points[0].date)) / DAY / 365.25;
  const strategyReturns = points.slice(1).map((point, index) => point.value / points[index].value - 1);
  const benchmarkReturns = points.slice(1).map((point, index) => point.benchmark / points[index].benchmark - 1);
  const active = strategyReturns.map((value, index) => value - benchmarkReturns[index]);
  const annualRiskFree = .065, dailyRiskFree = (1 + annualRiskFree) ** (1 / 252) - 1;
  const volatility = deviation(strategyReturns) * Math.sqrt(252);
  const downside = Math.sqrt(mean(strategyReturns.map((value) => Math.min(0, value - dailyRiskFree) ** 2))) * Math.sqrt(252);
  const trackingError = deviation(active) * Math.sqrt(252);
  const beta = covariance(strategyReturns, benchmarkReturns) / variance(benchmarkReturns);
  const cagr = years >= 1 ? (points.at(-1)!.value / points[0].value) ** (1 / years) - 1 : Number.NaN;
  const benchmarkCagr = years >= 1 ? (points.at(-1)!.benchmark / points[0].benchmark) ** (1 / years) - 1 : Number.NaN;
  const drawdowns = drawdownSeries(points);
  const maxDrawdown = Math.min(...drawdowns.map((point) => point.value));
  const monthly = monthlyReturns(points);
  return {
    observations: points.length,
    years,
    total: (points.at(-1)!.value / points[0].value - 1) * 100,
    benchmarkTotal: (points.at(-1)!.benchmark / points[0].benchmark - 1) * 100,
    cagr: cagr * 100,
    benchmarkCagr: benchmarkCagr * 100,
    volatility: volatility * 100,
    downsideDeviation: downside * 100,
    sharpe: volatility > 0 ? (mean(strategyReturns) - dailyRiskFree) * 252 / volatility : Number.NaN,
    sortino: downside > 0 ? (mean(strategyReturns) - dailyRiskFree) * 252 / downside : Number.NaN,
    calmar: maxDrawdown < 0 ? cagr / Math.abs(maxDrawdown / 100) : Number.NaN,
    beta,
    alpha: ((mean(strategyReturns) - dailyRiskFree) - beta * (mean(benchmarkReturns) - dailyRiskFree)) * 252 * 100,
    correlation: covariance(strategyReturns, benchmarkReturns) / (deviation(strategyReturns) * deviation(benchmarkReturns)),
    trackingError: trackingError * 100,
    informationRatio: trackingError > 0 ? mean(active) * 252 / trackingError : Number.NaN,
    maxDrawdown,
    positiveMonths: monthly.filter((month) => month.value > 0).length / Math.max(1, monthly.length) * 100,
  };
}

export function benchmarkMetrics(points: Point[]) {
  return calculateMetrics(points.map((point) => ({ date: point.date, value: point.benchmark, benchmark: point.benchmark })));
}

export function formatPercent(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "N/A";
}

export function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "N/A";
}

export function seriesLabel(series: string) {
  return series === "composite" ? "Composite average" : `${months[Number(series)]}${series === "0" ? " — default" : ""}`;
}
