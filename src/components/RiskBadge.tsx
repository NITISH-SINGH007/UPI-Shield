import type { RiskLevel } from '@/types/analysis';

const config: Record<RiskLevel, { bg: string; text: string; ring: string; dot: string }> = {
  LOW: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    ring: 'ring-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  MEDIUM: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    ring: 'ring-amber-500/30',
    dot: 'bg-amber-400',
  },
  HIGH: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-300',
    ring: 'ring-orange-500/30',
    dot: 'bg-orange-400',
  },
  CRITICAL: {
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    ring: 'ring-red-500/30',
    dot: 'bg-red-400',
  },
};

export default function RiskBadge({
  level,
  score,
  showScore = false,
}: {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
}) {
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${c.bg} ${c.text} ring-1 ${c.ring}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot} animate-pulse`} />
      {level} RISK
      {showScore && score !== undefined && (
        <span className="opacity-70">· {score}/100</span>
      )}
    </span>
  );
}
