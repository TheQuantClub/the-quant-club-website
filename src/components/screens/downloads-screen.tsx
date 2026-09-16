"use client";

import Link from "next/link";
import { Download, FileArchive, FileSpreadsheet, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { strategies } from "@/lib/data";
import { Button, PageHeading } from "../ui";

const baseFiles = [
  { name:"September 2027 portfolio pack", strategy:"All strategies", type:"ZIP", date:"01 Sep 2027", copy:"The complete monthly release for your firm." },
  ...strategies.map((strategy)=>({name:strategy.name,strategy:strategy.name,type:"CSV",date:"01 Sep 2027",copy:"Current equal-weight model holdings."})),
  { name:"Firm analytics export",strategy:"All strategies",type:"CSV",date:"Selected period",copy:"Strategy and benchmark risk measures." },
  { name:"Methodology collection",strategy:"All strategies",type:"PDF",date:"Updated 01 Sep 2027",copy:"Current rules for all licensed strategies." },
];

export function DownloadsScreen() {
  const [query,setQuery]=useState(""); const [type,setType]=useState("All");
  const files=useMemo(()=>baseFiles.filter((file)=>(type==="All"||file.type===type)&&`${file.name} ${file.strategy} ${file.copy}`.toLowerCase().includes(query.toLowerCase())),[query,type]);
  const download=(name:string,type:string)=>{const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([`The Quant Club\n${name}\n\nSynthetic demonstration file for interface testing.`],{type:"text/plain"}));link.download=`${name.toLowerCase().replaceAll(" ","-")}-DEMO.${type.toLowerCase()==="pdf"?"txt":type.toLowerCase()}`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)};
  return <><PageHeading eyebrow="Firm file center" title="Downloads">Find current and historical exports across every licensed strategy from one searchable workspace.</PageHeading><div className="download-toolbar"><label className="search"><Search size={16}/><input placeholder="Search files" value={query} onChange={(event)=>setQuery(event.target.value)}/></label><div className="filters">{["All","CSV","PDF","ZIP"].map((value)=><button key={value} aria-pressed={type===value} onClick={()=>setType(value)}>{value}</button>)}</div></div><div className="document-list">{files.map((file)=>{const Icon=file.type==="PDF"?FileText:file.type==="ZIP"?FileArchive:FileSpreadsheet;return <article className="document-row" key={`${file.name}-${file.type}`}><div className="file-icon"><Icon size={18}/></div><div><h3>{file.name}</h3><p>{file.copy}</p></div><span>{file.type} · {file.date}</span>{file.strategy!=="All strategies"?<Link className="button button--secondary" href={`/strategy/${strategies.find((strategy)=>strategy.name===file.strategy)?.id}/documents`}>Open files</Link>:<Button variant="secondary" onClick={()=>download(file.name,file.type)}><Download size={14}/>Download</Button>}</article>})}</div></>;
}
