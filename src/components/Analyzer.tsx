import { useState, useRef } from 'react';
import { Loader2, Search, Trash2, Upload, Link2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';
import { analyzeMessage } from '@/services/analyzeMessage';
import { extractTextFromImage } from '@/services/ocrService';
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
  const [mode, setMode] = useState<'message' | 'screenshot'>('message');
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError('Please provide a message to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await analyzeMessage(input);
      onResult(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setError('');
    setOcrProgress(0);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError('');
    setLoading(true);
    setOcrProgress(0);
    try {
      const text = await extractTextFromImage(file, (p) => setOcrProgress(Math.round(p * 100)));
      if (text.trim()) {
        setInput(text);
        setMode('message');
        // Optional: Auto analyze after extracting text
        // await handleAnalyze();
      } else {
        setError('Could not extract text from the image. Please try another image or paste manually.');
      }
    } catch (e) {
      setError('OCR failed. Please try again or paste the text manually.');
    } finally {
      setLoading(false);
      setOcrProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="analyzer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <div className="flex items-center gap-2 text-cyan-300">
        <Search className="h-5 w-5" />
        <h2 className="text-lg font-semibold text-white">Analyze a suspicious message</h2>
      </div>
      <p className="mt-1.5 text-sm text-slate-400">
        Paste an SMS, WhatsApp message, payment request or upload a screenshot below.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-900/50 p-1 w-max border border-white/5">
        <button
          onClick={() => setMode('message')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${mode === 'message' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          Message Text
        </button>
        <button
          onClick={() => setMode('screenshot')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition flex items-center gap-2 ${mode === 'screenshot' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <ImageIcon className="h-4 w-4" /> Screenshot
        </button>
      </div>

      <div className="mt-5 relative">
        {mode === 'message' ? (
          <div>
            <label htmlFor="message-input" className="sr-only">Suspicious message</label>
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
        ) : (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full rounded-xl border-2 border-dashed border-white/10 bg-slate-900/50 px-4 py-10 text-center transition hover:border-cyan-500/30 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            {loading && ocrProgress > 0 ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
                <p className="text-sm text-cyan-300">Extracting text... {ocrProgress}%</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-slate-500 mb-3" />
                <p className="text-sm text-slate-300 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG or WEBP formats supported</p>
                {error && (
                  <p className="mt-4 flex items-center justify-center gap-1 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading && !ocrProgress ? (
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

      <div className="mt-6 border-t border-white/5 pt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Example Scenarios</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sampleExamples.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(ex);
                setError('');
                setMode('message');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 transition hover:border-cyan-500/30 hover:text-cyan-200"
            >
              <Link2 className="h-3 w-3" /> 
              {i === 0 ? 'Electricity Scam' : i === 1 ? 'Prize Scam' : 'OTP Scam'}
            </button>
          ))}
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
