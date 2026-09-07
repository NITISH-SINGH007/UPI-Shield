import { MessageSquareText, ScanSearch, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: MessageSquareText,
    title: 'Input',
    desc: 'SMS, WhatsApp, UPI or payment message pasted for analysis.',
  },
  {
    icon: ScanSearch,
    title: 'Contextual Analysis',
    desc: 'Urgency, coercion, payment, impersonation & semantic signals combined.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Result',
    desc: 'Threat score, plain-language explanation & bilingual safety guidance.',
  },
];

export default function HowItWorks() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
      <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-cyan-300">
        How It Works
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <s.icon className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="mt-3 text-xs font-bold text-slate-500">STEP {i + 1}</div>
              <h4 className="mt-1 text-base font-semibold text-white">{s.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="absolute right-0 top-6 hidden h-px w-1/2 bg-gradient-to-r from-cyan-500/30 to-transparent md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
