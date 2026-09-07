import { BrainCircuit } from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';

export default function ContextAnalysis({ result }: { result: AnalysisResult }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-cyan-300">
        <BrainCircuit className="h-5 w-5" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Context Analysis</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-200">{result.contextSummary}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 ring-1 ring-white/10">
          Confidence: {result.confidence}%
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 ring-1 ring-white/10">
          Signals detected: {result.signals.length}
        </span>
      </div>
    </div>
  );
}
