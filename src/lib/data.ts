export type Strategy = {
  id: string;
  name: string;
  shortName: string;
  type: "Equity" | "Mutual funds";
  category: string;
  count: number;
  universe: string;
  lead: string;
  description: string;
  risk: string;
  benchmark: string;
};

export const strategies: Strategy[] = [
  {
    id: "large-cap",
    name: "Quant x Large Cap Club",
    shortName: "Large Cap Club",
    type: "Equity",
    category: "Large cap",
    count: 25,
    universe: "Large-cap equities",
    lead: "A rules-led portfolio for India’s large-cap equity universe.",
    description: "A systematic, equally weighted model built from a defined large-cap universe and reviewed on a six-month cycle.",
    risk: "Equity declines and periods of benchmark underperformance remain possible. Equal weights can differ materially from a market-cap-weighted index.",
    benchmark: "Nifty 100 TRI",
  },
  {
    id: "mid-cap",
    name: "Quant x Mid Cap Club",
    shortName: "Mid Cap Club",
    type: "Equity",
    category: "Mid cap",
    count: 30,
    universe: "Mid-cap equities",
    lead: "A structured approach to the mid-cap universe.",
    description: "A systematic, equally weighted mid-cap model with consistent portfolio construction and a six-month rebalance cycle.",
    risk: "Mid-cap holdings can experience substantial volatility and lower liquidity. Diversification does not remove market risk.",
    benchmark: "Nifty Midcap 150 TRI",
  },
  {
    id: "small-cap",
    name: "Quant x Small Cap Club",
    shortName: "Small Cap Club",
    type: "Equity",
    category: "Small cap",
    count: 30,
    universe: "Small-cap equities",
    lead: "A consistent framework for small-cap research.",
    description: "A systematic, equally weighted small-cap model with a fixed holding count and scheduled six-month rebalance cycle.",
    risk: "Small-cap holdings can have sharp drawdowns, limited trading liquidity and meaningful execution differences from model prices.",
    benchmark: "Nifty Smallcap 250 TRI",
  },
  {
    id: "multi-cap",
    name: "Quant x Multi Cap Club",
    shortName: "Multi Cap Club",
    type: "Equity",
    category: "Multi cap",
    count: 30,
    universe: "Equities across market-cap segments",
    lead: "One systematic research framework across market-cap segments.",
    description: "An equally weighted model spanning large, mid and small-cap segments with disciplined portfolio construction.",
    risk: "Exposure across market-cap segments still carries equity market risk. Actual segment exposure depends on selected holdings.",
    benchmark: "Nifty 500 TRI",
  },
  {
    id: "diversified-mf",
    name: "Quant x Diversified Mutual Fund Club",
    shortName: "Diversified Mutual Fund Club",
    type: "Mutual funds",
    category: "Diversified funds",
    count: 12,
    universe: "Diversified mutual funds",
    lead: "A considered structure for diversified mutual-fund allocation.",
    description: "An equally weighted model of diversified mutual funds, delivered as a dated portfolio with a six-month rebalance schedule.",
    risk: "Underlying funds can overlap in their exposures. Market risk, fund expenses and transaction terms affect outcomes.",
    benchmark: "Nifty 500 TRI",
  },
  {
    id: "sector-rotation",
    name: "Quant x Sector Rotation Club",
    shortName: "Sector Rotation Club",
    type: "Mutual funds",
    category: "Sector rotation",
    count: 8,
    universe: "Sector and thematic mutual funds",
    lead: "A repeatable framework for tactical sector allocation.",
    description: "An equally weighted sector-allocation model that applies systematic signals to eligible sector and thematic funds.",
    risk: "Sector concentration can produce uneven results and extended periods of underperformance.",
    benchmark: "Nifty 500 TRI",
  },
];

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const researchEnd = "2027-09-01";

export function strategyById(id?: string) {
  return strategies.find((strategy) => strategy.id === id) ?? strategies[0];
}

export type Holding = { name: string; code: string; weight: number; change: "Added" | "Retained" | "Initial" };

export function historicalHoldings(strategy: Strategy, year: number, month: number): Holding[] {
  const epoch = (year - 2013) * 12 + month;
  const phase = month % 6;
  const cycle = Math.floor(epoch / 6);
  const pool = strategy.count + 12;
  return Array.from({ length: strategy.count }, (_, index) => {
    const number = ((index + cycle * 2 + phase * 3) % pool) + 1;
    return {
      name: `Demo ${strategy.type === "Equity" ? "Equity" : "Fund"} ${String(number).padStart(2, "0")}`,
      code: `DEMO-${strategy.id.toUpperCase()}-${String(number).padStart(2, "0")}`,
      weight: 100 / strategy.count,
      change: epoch < 6 ? "Initial" : index < 3 ? "Added" : "Retained",
    };
  });
}
