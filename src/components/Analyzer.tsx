import { useState } from 'react';
import { Loader2, Search, Trash2, Upload, Link2, AlertCircle } from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';
import { analyzeMessage } from '@/services/analyzeMessage';
import RiskBadge from './RiskBadge';

const sampleExamples = [
  'URGENT! Your electricity connection will be disconnected today. Verify your account immediately by paying ₹10 using this UPI link: upi://pay?pa=verify@upi',
  'Congratulations! You have won ₹50,000. Pay ₹499 processing fee immediately to claim your reward.',
  'Your bank account will be blocked within 24 hours. Share your OTP and complete verification now.',
];

export default function Analyzer({
  onResult,
  input,
  setInput,
}: {
  onResult: (r: AnalysisResult) => void;
  input: string;
  setInput: (s: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (!input.trim()) {
      setError('Please paste a message to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate analysis latency for UX; the engine itself is synchronous.
    setTimeout(() => {
      const result = analyzeMessage(input);
      onResult(result);
      setLoading(false);
    }, 850);
  };

  const handleClear = () => {
    setInput('');
    setError('');
  };

  return (
    <div id="analyzer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <div className="flex items-center gap-2 text-cyan-300">
        <Search className="h-5 w-5" />
        <h2 className="text-lg font-semibold text-white">Analyze a suspicious message</h2>
      </div>
      <p className="mt-1.5 text-sm text-slate-400">
        Paste an SMS, WhatsApp message, payment request or suspicious text below.
      </p>

      <div className="mt-5">
        <label htmlFor="message-input" className="sr-only">
          Suspicious message
        </label>
        <textarea
          id="message-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError('');
          }}
          placeholder="Paste suspicious message here..."
          rows={6}
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
          <span>{input.length} characters</span>
          {error && (
            <span className="inline-flex items-center gap-1 text-red-400">
              <AlertCircle className="h-3 w-3" /> {error}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Analyze Message
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
        >
          <Trash2 className="h-4 w-4" /> Clear
        </button>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Example messages</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sampleExamples.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(ex);
                setError('');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 transition hover:border-cyan-500/30 hover:text-cyan-200"
            >
              <Link2 className="h-3 w-3" /> Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Screenshot OCR — disabled, API-ready */}
      <div className="mt-6 border-t border-white/5 pt-5">
        <div className="flex items-center gap-2 text-slate-400">
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">Upload Screenshot</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-white/10">
            Coming in API integration
          </span>
        </div>
        <div className="mt-2 cursor-not-allowed rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-6 text-center">
          <Upload className="mx-auto h-6 w-6 text-slate-600" />
          <p className="mt-2 text-xs text-slate-600">
            Screenshot OCR will be available once the AI vision API is connected.
          </p>
        </div>
      </div>

      {/* Quick risk legend */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
        <span className="text-xs text-slate-500">Risk scale:</span>
        <RiskBadge level="LOW" />
        <RiskBadge level="MEDIUM" />
        <RiskBadge level="HIGH" />
        <RiskBadge level="CRITICAL" />
      </div>
    </div>
  );
}
