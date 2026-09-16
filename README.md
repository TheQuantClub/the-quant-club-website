# The Quant Club — V1 Research Workspace

Frontend-only Next.js implementation of the approved V1 product flow for RIA firms.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/strategies`.

If you use pnpm:

```bash
pnpm install
pnpm dev
```

## Included flows

- Licensed strategy catalogue with search and asset-type filters
- Strategy overview, methodology, facts and risk presentation
- Performance workspace with twelve start-month series and composite analysis
- Date range and illustrative pre/post-tax controls
- Strategy and benchmark metrics that recalculate with the selected period
- Full analytics, drawdowns, rolling outcomes and monthly return table
- Two- or three-strategy comparison mode
- Historical monthly portfolios from January 2013 to September 2027
- Equal-weight holdings, change status and local CSV exports
- Strategy document center
- Combined monthly publication history
- Firm-wide downloads workspace
- Responsive desktop, tablet and mobile layouts

## Project structure

- `src/app` — Next.js App Router entry points and global styles
- `src/components` — product shell, reusable UI primitives, charts and screens
- `src/lib/data.ts` — strategy and historical-holdings demo model
- `src/lib/analytics.ts` — synthetic NAV generation and risk calculations
- `public` — approved Quant Club brand assets

## Data and backend handoff

All holdings and performance data are synthetic and generated in the browser. The UI is ready for a developer to replace `src/lib/data.ts` and `src/lib/analytics.ts` with authenticated API calls, database-backed publications, and approved research data.
