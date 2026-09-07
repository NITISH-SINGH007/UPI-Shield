import type { AnalysisResult, DetectedSignal, RiskLevel, SignalSeverity } from '@/types/analysis';

/**
 * UPI-Shield contextual analysis engine.
 * Calls the secure backend API for Gemini/HF analysis,
 * falling back to local heuristic logic if the API fails.
 */

// Fallback logic
const UPI_URI_RE = /upi:\/\/pay\?[^)\s]*/i;
const VPA_RE = /pa=([^&\s]+)/i;

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => (p.test(text) ? n + 1 : n), 0);
}

const urgencyPatterns: RegExp[] = [/\burgent(ly)?\b/i, /\bimmediate(ly)?\b/i, /\btoday\b/i, /\bnow\b/i];
const threatPatterns: RegExp[] = [/\bdisconnect(ed|ion)?\b/i, /\bblocked?\b/i, /\bsuspend(ed|ion)?\b/i];
const paymentPatterns: RegExp[] = [/\bpay\b/i, /\b(?:₹|rs\.?|inr)\s?\d/i];
const credentialPatterns: RegExp[] = [/\botp\b/i, /\bpin\b/i, /\bpassword\b/i];

function fallbackAnalyze(message: string): AnalysisResult {
  const text = message.trim();
  const upiMatch = text.match(UPI_URI_RE);
  const vpaMatch = upiMatch ? upiMatch[0].match(VPA_RE) : null;
  const urgency = countMatches(text, urgencyPatterns) > 0;
  const threat = countMatches(text, threatPatterns) > 0;
  const payment = countMatches(text, paymentPatterns) > 0;
  const creds = countMatches(text, credentialPatterns) > 0;

  let score = 0;
  const signals: DetectedSignal[] = [];

  if (urgency) { score += 20; signals.push({ category: 'urgency', label: 'Urgency Pressure', severity: 'medium', explanation: 'Immediate action language detected.'}); }
  if (threat) { score += 30; signals.push({ category: 'threat', label: 'Threat / Coercion', severity: 'high', explanation: 'Mentions account blocking or disconnection.'}); }
  if (payment) { score += 20; signals.push({ category: 'payment', label: 'Payment Request', severity: 'medium', explanation: 'Requests a monetary transaction.'}); }
  if (creds) { score += 40; signals.push({ category: 'credential', label: 'Credential Request', severity: 'critical', explanation: 'Asks for sensitive credentials like OTP.'}); }
  if (upiMatch) { score += 20; signals.push({ category: 'upi', label: 'Suspicious UPI', severity: 'high', explanation: 'Contains a UPI payment URI.'}); }

  if (signals.length >= 3) score += 20;
  score = Math.min(100, score);
  
  const riskLevel: RiskLevel = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';

  return {
    threatScore: score,
    riskLevel,
    confidence: 80,
    signals,
    contextSummary: `Fallback analysis detected ${signals.length} cautionary signals. Verify independently.`,
    upi: {
      detected: !!upiMatch,
      vpa: vpaMatch ? vpaMatch[1] : undefined,
      uri: upiMatch ? upiMatch[0] : undefined,
      note: upiMatch ? 'A UPI payment URI was detected. Verify the destination before payment.' : '',
    },
    recommendedActions: score >= 60 
      ? ['Do not click links.', 'Do not make the requested payment.']
      : ['Treat with caution.', 'Verify independently.'],
  };
}

export async function analyzeMessage(message: string): Promise<AnalysisResult> {
  const text = message.trim();
  if (!text) {
    return {
      threatScore: 0,
      riskLevel: 'LOW',
      confidence: 0,
      signals: [],
      contextSummary: 'No message provided for analysis.',
      upi: { detected: false, note: '' },
      recommendedActions: [],
    };
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      throw new Error('API unavailable');
    }

    const data = await response.json();
    
    // Map API JSON back to frontend AnalysisResult shape
    const upiMatch = text.match(UPI_URI_RE);
    const vpaMatch = upiMatch ? upiMatch[0].match(VPA_RE) : null;

    return {
      threatScore: data.riskScore,
      riskLevel: data.riskLevel,
      confidence: 90,
      signals: data.signals.map((s: any) => ({
        category: s.category,
        label: s.category.toUpperCase(),
        severity: s.severity.toLowerCase() as SignalSeverity,
        explanation: s.explanation,
      })),
      contextSummary: data.contextualReasoning || data.summary,
      upi: {
        detected: data.upiDetected || !!upiMatch,
        vpa: data.upiId || (vpaMatch ? vpaMatch[1] : undefined),
        uri: upiMatch ? upiMatch[0] : undefined,
        note: (data.upiDetected || upiMatch) ? 'A UPI payment URI was detected. Independently verify the destination VPA before considering any payment.' : '',
      },
      recommendedActions: data.recommendedActions || [],
    };

  } catch (error) {
    console.error('Analysis API failed, falling back to local heuristic engine', error);
    return fallbackAnalyze(message);
  }
}
