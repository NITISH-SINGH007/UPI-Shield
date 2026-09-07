import { AlertTriangle } from 'lucide-react';
import type { RiskLevel } from '@/types/analysis';
import { getSafetyCopy } from '@/services/translationService';

export default function SafetyWarning({ level, lang = 'en' }: { level: RiskLevel, lang?: 'en' | 'hi' }) {
  const copy = getSafetyCopy(level, lang);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Safety Warning</h3>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{copy.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{copy.body}</p>
      </div>
    </div>
  );
}
