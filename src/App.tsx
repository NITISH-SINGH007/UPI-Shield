import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ScanLine,
  AlertTriangle,
  Info,
  Lock,
  ArrowDown,
  Send,
} from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';
import Analyzer from '@/components/Analyzer';
import ThreatMeter from '@/components/ThreatMeter';
import RiskBadge from '@/components/RiskBadge';
import SignalCard from '@/components/SignalCard';
import SafetyWarning from '@/components/SafetyWarning';
import ContextAnalysis from '@/components/ContextAnalysis';
import RecommendedActions from '@/components/RecommendedActions';
import DemoExamples from '@/components/DemoExamples';
import HowItWorks from '@/components/HowItWorks';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
        <Shield className="h-5 w-5 text-white" />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 text-[8px] font-bold text-cyan-300 ring-1 ring-cyan-500/40">
          ₹
        </span>
      </div>
      <div className="leading-none">
        <span className="text-base font-bold tracking-tight text-white">
          UPI<span className="text-cyan-400">-</span>Shield
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Scam & Coercion Detector
        </span>
      </div>
    </div>
  );
}

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalResult, setOriginalResult] = useState<AnalysisResult | null>(null);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const scrollToAnalyzer = () => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDemoSelect = (text: string) => {
    setInput(text);
    setResult(null);
    setOriginalResult(null);
    scrollToAnalyzer();
  };

  const handleAnalysisResult = (r: AnalysisResult) => {
    setOriginalResult(r);
    setResult(r); // Initially english
    if (lang === 'hi') {
      translateResult(r, 'hi');
    }
  };

  const translateResult = async (r: AnalysisResult, targetLang: 'en' | 'hi') => {
    if (targetLang === 'en') {
      setResult(originalResult);
      return;
    }
    
    // Quick local mock translation if real API isn't wired up, or we can use the backend API
    // To save time and keep it simple for hackathon, we fetch the translation for the contextual summary and recommended actions.
    try {
      const { translateText } = await import('@/services/translationService');
      const translatedSummary = await translateText(r.contextSummary);
      const translatedActions = await Promise.all(r.recommendedActions.map(a => translateText(a)));
      const translatedSignals = await Promise.all(r.signals.map(async s => ({
        ...s,
        explanation: await translateText(s.explanation)
      })));

      setResult({
        ...r,
        contextSummary: translatedSummary,
        recommendedActions: translatedActions,
        signals: translatedSignals,
      });
    } catch (e) {
      console.error('Failed to translate result');
    }
  };

  useEffect(() => {
    if (originalResult) {
      translateResult(originalResult, lang);
    }
  }, [lang, originalResult]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Ambient cybersecurity background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-blue-700/10 blur-[100px]" />
        <div className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan-line"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
            <a href="#analyzer" className="transition hover:text-white">Analyze</a>
            <a href="#how" className="transition hover:text-white">How It Works</a>
            <a href="#about" className="transition hover:text-white">About</a>
            <div className="h-4 w-px bg-white/10"></div>
            <button 
              onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 font-medium text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              {lang === 'en' ? 'EN' : 'हिंदी'}
            </button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pb-10 pt-16 text-center sm:pt-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-1 text-xs font-medium text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            AI-Assisted Contextual Analysis
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Think Before You <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pay.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            UPI-Shield detects contextual scam, coercion and social-engineering signals hidden inside digital payment messages and screenshots.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <button
                onClick={scrollToAnalyzer}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
              >
                <ScanLine className="h-4 w-4" /> Analyze a Message
              </button>
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Try Demo
              </button>
            </div>
            <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-500"/> Context-Aware</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-500"/> AI-Assisted</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-500"/> English + हिंदी</span>
            </div>
          </div>
        </section>

        {/* Analyzer + Results */}
        <section className="pb-12">
          <Analyzer onResult={handleAnalysisResult} input={input} setInput={setInput} />

          {result && (
            <div className="mt-6 space-y-5 animate-slide-up">
              {/* Threat assessment */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <AlertTriangle className="h-5 w-5" />
                      <h2 className="text-sm font-semibold uppercase tracking-wide">Threat Assessment</h2>
                    </div>
                    <div className="mt-4">
                      <RiskBadge level={result.riskLevel} score={result.threatScore} showScore />
                    </div>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                      This message was assessed using contextual signal analysis across {result.signals.length}{' '}
                      detection categor{result.signals.length === 1 ? 'y' : 'ies'}.
                    </p>
                  </div>
                  <ThreatMeter score={result.threatScore} level={result.riskLevel} />
                </div>
              </div>

              {/* UPI Detection */}
              {result.upi.detected && (
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-orange-300">
                    <Send className="h-5 w-5" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide">UPI Payment Request Detected</h3>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {result.upi.vpa && (
                      <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="text-xs text-slate-500">Detected UPI ID (VPA)</span>
                        <p className="mt-0.5 font-mono text-orange-200">{result.upi.vpa}</p>
                      </div>
                    )}
                    {result.upi.uri && (
                      <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="text-xs text-slate-500">Payment URI</span>
                        <p className="mt-0.5 break-all font-mono text-xs text-orange-200/80">{result.upi.uri}</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-amber-200/90">
                    ⚠️ {result.upi.note}
                  </p>
                </div>
              )}

              {/* Safety Warning */}
              <SafetyWarning level={result.riskLevel} lang={lang} />

              {/* Why flagged */}
              {result.signals.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Why this message was flagged
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.signals.map((s) => (
                      <SignalCard key={s.category} signal={s} />
                    ))}
                  </div>
                </div>
              )}

              {/* Context + Actions */}
              <div className="grid gap-5 lg:grid-cols-2">
                <ContextAnalysis result={result} />
                <RecommendedActions result={result} />
              </div>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section id="how" className="pb-12">
          <HowItWorks />
        </section>

        {/* Demo */}
        <section className="pb-12">
          <DemoExamples onSelect={handleDemoSelect} />
        </section>

        {/* About */}
        <section id="about" className="pb-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-300">
              <Info className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">About UPI-Shield</h3>
            </div>
            <div className="mt-3 grid gap-4 text-sm leading-relaxed text-slate-300 sm:grid-cols-2">
              <p>
                UPI-Shield is a decision-support safety tool that inspects the contextual meaning of
                digital payment messages — looking for urgency, authority impersonation, threats,
                payment requests, credential asks and coercion signals — rather than relying on
                simple keyword matching.
              </p>
              <p>
                It combines multiple weak signals into a composite threat score and explains the
                reasoning in plain language, with bilingual (English & Hindi) safety guidance. It is
                not a guaranteed fraud detector — always verify independently through official
                channels.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="pb-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-300">
              <Lock className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Privacy & Safety</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Your message is analyzed only to generate a safety assessment. Do not enter passwords,
              OTPs, PINs or other sensitive credentials. Messages are not stored — there is no
              database and no data retention. All analysis runs in your browser session.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-center text-xs text-slate-500 sm:text-right">
            Decision-support safety tool · Not a guaranteed fraud detector.<br />
            Verify independently through official channels.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
