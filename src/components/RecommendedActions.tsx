import { CheckCircle2, ShieldCheck } from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';

export default function RecommendedActions({ result }: { result: AnalysisResult }) {
  const high =
    result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-emerald-300">
        <ShieldCheck className="h-5 w-5" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">What should you do?</h3>
      </div>
      <ol className="mt-3 space-y-2.5">
        {result.recommendedActions.map((a, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${high ? 'text-emerald-300' : 'text-cyan-300'}`}
            />
            <span className="leading-relaxed">{a}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
