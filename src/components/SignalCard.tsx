import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { DetectedSignal, SignalSeverity } from '@/types/analysis';

const sevStyle: Record<SignalSeverity, { ring: string; icon: string; label: string }> = {
  low: { ring: 'ring-emerald-500/20', icon: 'text-emerald-300', label: 'LOW' },
  medium: { ring: 'ring-amber-500/25', icon: 'text-amber-300', label: 'MEDIUM' },
  high: { ring: 'ring-orange-500/30', icon: 'text-orange-300', label: 'HIGH' },
  critical: { ring: 'ring-red-500/35', icon: 'text-red-300', label: 'CRITICAL' },
};

export default function SignalCard({ signal }: { signal: DetectedSignal }) {
  const s = sevStyle[signal.severity];
  const isHigh = signal.severity === 'high' || signal.severity === 'critical';
  return (
    <div
      className={`rounded-xl bg-white/[0.03] p-4 ring-1 ${s.ring} backdrop-blur-sm transition hover:bg-white/[0.06]`}
    >
      <div className="flex items-start gap-3">
        {isHigh ? (
          <ShieldAlert className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`} />
        ) : (
          <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`} />
        )}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">{signal.label}</h4>
            <span className={`shrink-0 text-[10px] font-bold ${s.icon}`}>{s.label}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{signal.explanation}</p>
        </div>
      </div>
    </div>
  );
}
