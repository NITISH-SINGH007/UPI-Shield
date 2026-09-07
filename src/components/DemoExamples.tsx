import { ClipboardPaste } from 'lucide-react';

const examples: { label: string; text: string }[] = [
  {
    label: 'Electricity disconnection scam',
    text: 'URGENT! Your electricity connection will be disconnected today. Verify your account immediately by paying ₹10 using this UPI link: upi://pay?pa=verify@upi',
  },
  {
    label: 'Fake prize scam',
    text: 'Congratulations! You have won ₹50,000. Pay ₹499 processing fee immediately to claim your reward.',
  },
  {
    label: 'Bank OTP scam',
    text: 'Your bank account will be blocked within 24 hours. Share your OTP and complete verification now.',
  },
  {
    label: 'Normal electricity bill message',
    text: 'Please pay your electricity bill through the official website before the due date.',
  },
];

export default function DemoExamples({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-cyan-300">
        <ClipboardPaste className="h-5 w-5" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Try a Demo</h3>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Load a sample message into the analyzer to see how contextual detection works.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {examples.map((ex) => (
          <button
            key={ex.label}
            onClick={() => onSelect(ex.text)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.06] hover:text-white"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
