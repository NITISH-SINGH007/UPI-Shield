import { useState } from 'react';
import { AlertTriangle, Languages } from 'lucide-react';
import type { RiskLevel } from '@/types/analysis';
import { getSafetyCopy } from '@/services/translationService';

export default function SafetyWarning({ level }: { level: RiskLevel }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const copy = getSafetyCopy(level, lang);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Safety Warning</h3>
        </div>
        <div className="inline-flex rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10">
          {(['en', 'hi'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition ${
                lang === l ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={lang === l}
            >
              {l === 'en' ? <Languages className="h-3 w-3" /> : null}
              {l === 'en' ? 'English' : 'हिंदी'}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{copy.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{copy.body}</p>
      </div>
    </div>
  );
}
