"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { strategies } from "@/lib/data";
import { Badge, PageHeading, Panel } from "../ui";

const releases = [
  ["September 2027","1 Sep 2027 · 11:45 AM IST","Six portfolios · Combined email sent"],
  ["August 2027","1 Aug 2027 · 11:37 AM IST","Six portfolios · No scheduled rebalance"],
  ["July 2027","1 Jul 2027 · 11:51 AM IST","Six portfolios · Mid-year methodology note"],
  ["June 2027","1 Jun 2027 · 11:32 AM IST","Six portfolios · Rebalance cycle update"],
  ["May 2027","1 May 2027 · 11:44 AM IST","Six portfolios · No scheduled rebalance"],
];

export function PublicationsScreen() {
  return <><PageHeading eyebrow="Firm-wide updates" title="Publications">One combined monthly release covering every licensed strategy, delivered to every active team member.</PageHeading><section className="publication-hero"><div><p className="eyebrow">September 2027 · Published</p><h2>All six portfolios are available.</h2><p>Published on 1 September 2027 at 11:45 AM IST. One combined notification was sent to every active team member.</p></div><CheckCircle2 size={36}/></section><div className="publication-layout"><Panel><div className="section-heading"><div><h2>Latest release</h2><p>Open each model portfolio from the combined monthly batch.</p></div><span className="mail-status"><Mail size={15}/>Combined email</span></div>{strategies.map((strategy)=><article className="release-strategy" key={strategy.id}><div><h3>{strategy.name}</h3><p>{strategy.count} equal-weight holdings · {strategy.category}</p></div><Link href={`/strategy/${strategy.id}/portfolio`}>View portfolio <ArrowRight size={14}/></Link></article>)}<p className="hint">Publication deadline: first calendar day of every month by 12:00 PM IST, including weekends and holidays.</p></Panel><Panel><h2>Publication archive</h2><div className="release-list">{releases.map(([title,date,copy])=><article key={title}><div><h3>{title}</h3><p>{date}</p></div><div><Badge>Published</Badge><p>{copy}</p></div></article>)}</div></Panel></div></>;
}
