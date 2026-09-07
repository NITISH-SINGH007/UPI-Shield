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
      className={`group rounded-xl bg-white/[0.02] p-5 ring-1 ${s.ring} backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:shadow-[0_0_20px_-5px_var(--tw-shadow-color)] ${isHigh ? 'shadow-red-500/20' : 'shadow-amber-500/20'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 rounded-full p-2 ring-1 ${s.ring} bg-white/[0.02] transition-transform duration-300 group-hover:scale-110`}>
          {isHigh ? (
            <ShieldAlert className={`h-5 w-5 ${s.icon}`} />
          ) : (
            <AlertTriangle className={`h-5 w-5 ${s.icon}`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-100">{signal.label}</h4>
            <span className={`shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider ${s.icon}`}>
              {s.label}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">{signal.explanation}</p>
        </div>
      </div>
    </div>
  );
}
