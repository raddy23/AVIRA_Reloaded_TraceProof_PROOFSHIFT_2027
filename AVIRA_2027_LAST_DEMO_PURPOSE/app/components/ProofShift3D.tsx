import { useState } from "react";

/**
 * Dependency-free, accessible animated 3D-style visualization of verified numeric
 * inputs and bounded synthetic experiments. Not a physics or production simulator.
 */
export interface ProofShift3DProps {
  originalMs: number | null;
  deadlineMs: number;
  proposedMs?: number | null;
  proposedDeadlineMs?: number | null;
  experimentComplete: boolean;
  operation?: string;
}

import { chartValues } from '../../lib/proofshift-chart.mjs';

export default function ProofShift3D(props: ProofShift3DProps) {
  const [motion,setMotion] = useState(true);
  const d = chartValues(props);
  const max = Math.max(1, d.original ?? 0, d.limit ?? 0, d.simulated ?? 0, d.simulatedLimit ?? 0);
  const chartH = (x: number | null) => x === null ? 0 : Math.round(x / max * 152);
  const fmt = (x: number | null) => x === null ? 'Unknown' : `${x} ms`;
  const bars=[{key:'recorded',label:'Recorded',value:d.original,fill:'#e5a49a',x:52},{key:'limit',label:'Limit',value:d.limit,fill:'#b7bdc6',x:160},{key:'experiment',label:'What-if',value:d.simulated,fill:'#a5cbbb',x:268}];
  return <section aria-label="Animated three-dimensional timing result chart" style={{background:'#ffffff',border:'1px solid #d6dce3',borderRadius:16,padding:16,overflow:'hidden'}}>
    <style>{`@keyframes avira-reveal { from {opacity:0;transform:translateY(10px)} to {opacity:1;transform:translateY(0)} }
    @keyframes avira-sway { 0%,100% {transform:perspective(900px) rotateX(8deg) rotateY(-8deg)} 50% {transform:perspective(900px) rotateX(12deg) rotateY(4deg)} }
    @media (prefers-reduced-motion: reduce) { .avira-3d-scene { animation:none !important; transform:none !important; } .avira-3d-bar { animation:none !important; } }`}</style>
    <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
      <div><strong style={{fontSize:17}}>ProofShift · 3D Timing Lab</strong><div style={{fontSize:12,color:'#596675',marginTop:4}}>Recorded evidence vs permitted limit vs approved synthetic what-if</div></div>
      <button type="button" aria-pressed={motion} onClick={()=>setMotion(v=>!v)} style={{background:'#f4f5f7',color:'#27313d',border:'1px solid #bfc7cf',padding:'8px 11px',borderRadius:9,cursor:'pointer'}}>{motion?'Pause 3D motion':'Resume 3D motion'}</button>
    </div>
    <div style={{perspective:'900px',marginTop:8}}>
      <svg className="avira-3d-scene" key={`${d.original}/${d.limit}/${d.simulated}/${d.simulatedLimit}`} role="img" aria-label={`Timing comparison: recorded ${fmt(d.original)}, limit ${fmt(d.limit)}, synthetic result ${fmt(d.simulated)}. ${d.simulated === null?'Experiment not run.':d.simulatedViolation?'Synthetic result violates the configured limit.':'Synthetic result is within the configured limit.'}`} viewBox="0 0 390 285" width="100%" style={{display:'block',maxHeight:320,transformStyle:'preserve-3d',transform:'perspective(900px) rotateX(8deg) rotateY(-8deg)',animation:motion?'avira-sway 9s ease-in-out infinite':'none'}}>
        <defs><linearGradient id="aviraFloor" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e8ecf0"/><stop offset="1" stopColor="#f3f5f7"/></linearGradient></defs>
        <path d="M 20 231 L 340 231 L 374 209 L 55 209 Z" fill="url(#aviraFloor)" stroke="#bac3cd"/>
        {[50,100,150,200].map(y=><line key={y} x1="30" y1={230-y} x2="363" y2={230-y} stroke="#9ba5b1" strokeDasharray="3 7" opacity=".38"/>)}
        {bars.map(bar=>{
          const h=chartH(bar.value), y=230-h, bw=58, depth=14;
          return <g className="avira-3d-bar" key={bar.key} style={{animation:motion?'avira-reveal 650ms ease both':'none'}}>
            {bar.value!==null?<>
              <path d={`M ${bar.x} ${y} L ${bar.x+bw} ${y} L ${bar.x+bw+depth} ${y-depth*.72} L ${bar.x+depth} ${y-depth*.72} Z`} fill={bar.fill} opacity=".95"/>
              <path d={`M ${bar.x+bw} ${y} L ${bar.x+bw+depth} ${y-depth*.72} L ${bar.x+bw+depth} ${230-depth*.72} L ${bar.x+bw} 230 Z`} fill={bar.fill} opacity=".40"/>
              <rect x={bar.x} y={y} width={bw} height={h} fill={bar.fill} opacity=".75" rx="2"/>
              <text x={bar.x+bw/2} y={Math.max(12,y-19)} fill="#252c34" textAnchor="middle" fontSize="13" fontWeight="bold">{fmt(bar.value)}</text>
            </>:<text x={bar.x+bw/2} y="153" fill="#667281" textAnchor="middle" fontSize="12">Not run</text>}
            <text x={bar.x+bw/2} y="254" fill="#343b45" textAnchor="middle" fontSize="13">{bar.label}</text>
          </g>;
        })}
      </svg>
    </div>
    <div aria-live="polite" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8}}>
      <div style={{padding:10,background:'#f1f4f6',borderRadius:9}}><div style={{fontSize:12,color:'#687583'}}>Original classification</div><strong style={{color:d.originalViolation===null?'#5f6874':d.originalViolation?'#b13e44':'#187148'}}>{d.originalViolation===null?'INCONCLUSIVE':d.originalViolation?'VIOLATION':'PASS'}</strong></div>
      <div style={{padding:10,background:'#f1f4f6',borderRadius:9}}><div style={{fontSize:12,color:'#687583'}}>Experiment classification</div><strong style={{color:d.simulatedViolation===null?'#5f6874':d.simulatedViolation?'#b13e44':'#187148'}}>{d.simulatedViolation===null?'NOT RUN':d.simulatedViolation?'VIOLATION':'PASS'}</strong></div>
    </div>
    <p style={{fontSize:12,color:'#687583',marginBottom:0}}>3D animated visualization of recorded timings and synthetic model results. A green simulated result does not prove a real production repair. Motion can be paused.</p>
  </section>;
}
