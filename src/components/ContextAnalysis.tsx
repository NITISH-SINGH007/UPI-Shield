import { BrainCircuit } from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';

export default function ContextAnalysis({ result }: { result: AnalysisResult }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm sm:p-7">
      <div className="flex items-center gap-2 text-cyan-300">
        <BrainCircuit className="h-5 w-5" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Context Analysis Pipeline</h3>
      </div>
      
      <div className="mt-6">
        <div className="relative border-l border-white/10 pl-6 pb-6">
          <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
          <h4 className="text-sm font-semibold text-white">1. Contextual Extraction</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Natural language processing parsed the intent behind the message, extracting the urgency, tone, and specific demands.
          </p>
        </div>
        
        <div className="relative border-l border-white/10 pl-6 pb-6">
          <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
          <h4 className="text-sm font-semibold text-white">2. Semantic Pattern Matching</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Detected {result.signals.length} behavioral flags indicating social engineering or coercion. The threat signature matches known scam profiles with a <span className="font-mono text-cyan-300">{result.confidence}%</span> confidence interval.
          </p>
        </div>

        <div className="relative pl-6">
          <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
          <h4 className="text-sm font-semibold text-white">3. Final Assessment</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
            {result.contextSummary}
          </p>
        </div>
      </div>

    </div>
  );
}
