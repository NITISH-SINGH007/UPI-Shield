import { useEffect, useState } from 'react';
import type { RiskLevel } from '@/types/analysis';

const color: Record<RiskLevel, { stroke: string; glow: string; label: string }> = {
  LOW: { stroke: '#34d399', glow: 'rgba(52,211,153,0.4)', label: 'text-emerald-300' },
  MEDIUM: { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.4)', label: 'text-amber-300' },
  HIGH: { stroke: '#fb923c', glow: 'rgba(251,146,60,0.45)', label: 'text-orange-300' },
  CRITICAL: { stroke: '#f87171', glow: 'rgba(248,113,113,0.5)', label: 'text-red-300' },
};

export default function ThreatMeter({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const [display, setDisplay] = useState(0);
  const c = color[level];

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 900;
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (score - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const radius = 80;
  const circ = Math.PI * radius; // semicircle
  const pct = display / 100;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible">
        <defs>
          <linearGradient id="meterGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c.stroke} stopOpacity="0.6" />
            <stop offset="100%" stopColor={c.stroke} />
          </linearGradient>
        </defs>
        {/* track */}
        <path
          d="M 30 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* progress */}
        <path
          d="M 30 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke="url(#meterGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${c.glow})`, transition: 'stroke-dasharray 0.1s linear' }}
        />
        <text
          x="110"
          y="95"
          textAnchor="middle"
          className="fill-white"
          style={{ fontSize: 38, fontWeight: 700 }}
        >
          {display}
        </text>
        <text x="110" y="115" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 12 }}>
          / 100
        </text>
      </svg>
      <div className={`mt-1 text-lg font-bold tracking-wide ${c.label}`}>{level} RISK</div>
    </div>
  );
}
