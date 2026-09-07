import type { AnalysisResult, DetectedSignal, RiskLevel, SignalSeverity } from '@/types/analysis';

/**
 * UPI-Shield mock contextual analysis engine.
 *
 * This evaluates combinations of signals — not exact keyword matching —
 * to approximate semantic scam detection. The scoring is based on how
 * many contextual categories co-occur and how strongly each fires.
 *
 * ---
 * API-READY HOOK:
 * Replace the body of `analyzeMessage` with a call to:
 *   POST /api/analyze { message }
 * which proxies to Gemini / Hugging Face classification APIs.
 * The return shape (AnalysisResult) stays the same so the UI is unchanged.
 * ---
 */

interface SignalMatch {
  label: string;
  severity: SignalSeverity;
  explanation: string;
  weight: number;
}

const UPI_URI_RE = /upi:\/\/pay\?[^)\s]*/i;
const VPA_RE = /pa=([^&\s]+)/i;

function has(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => (p.test(text) ? n + 1 : n), 0);
}

const urgencyPatterns: RegExp[] = [
  /\burgent(ly)?\b/i,
  /\bimmediate(ly)?\b/i,
  /\b(right|at)\s+once\b/i,
  /\bnow\b/i,
  /\btoday\b/i,
  /\bwithin\s+\d+\s*(hour|hr|minute|min|day)/i,
  /\blast\s+(chance|warning|notice)\b/i,
  /\bwithout\s+delay\b/i,
  /\bact\s+now\b/i,
  /\bexpires?\s+(today|soon|in)\b/i,
];

const threatPatterns: RegExp[] = [
  /\bdisconnect(ed|ion)?\b/i,
  /\bblocked?\b/i,
  /\bsuspend(ed|ion)?\b/i,
  /\bterminate(d|ion)?\b/i,
  /\bdeactivate(d|ion)?\b/i,
  /\bblacklist(ed)?\b/i,
  /\bdisabled?\b/i,
  /\bconsequence/i,
  /\bpenalty\b/i,
  /\blegal\s+action\b/i,
  /\b(archived|closed)\s+(your|the)\s+account\b/i,
  /\bwill\s+be\s+(blocked|disconnected|suspended|deactivated|terminated)\b/i,
];

const authorityPatterns: RegExp[] = [
  /\b(bank|rb?i|reserve\s+bank)\b/i,
  /\belectricity\s+(board|department|company|office|connection)\b/i,
  /\b(official|authorised|authorized)\s+(agent|executive|officer|representative|verifier)\b/i,
  /\bcustomer\s+(care|service|support)\b/i,
  /\bverification\s+(team|department|officer)\b/i,
  /\bgovernment\b/i,
  /\b(income\s+tax|gst|customs)\b/i,
  /\b(executive|officer)\b/i,
  /\b(helpline|toll\s*free)\b/i,
];

const paymentPatterns: RegExp[] = [
  /\bpay\b/i,
  /\bpayment\b/i,
  /\b(?:₹|rs\.?|inr)\s?\d/i,
  /\bamount\b/i,
  /\bfee\b/i,
  /\bcharge\b/i,
  /\bdeposit\b/i,
  /\btransfer\b/i,
  /\btransfer\s+(money|funds|amount)\b/i,
  /\bsend\s+(money|₹|rs|amount)\b/i,
];

const credentialPatterns: RegExp[] = [
  /\botp\b/i,
  /\bpin\b/i,
  /\bpassword\b/i,
  /\bupi\s?pin\b/i,
  /\b(?:cvv|cvc)\b/i,
  /\b(card|debit|credit)\s+(number|details?|info)\b/i,
  /\b(aadhaar|pan)\s?(card|number)?\b/i,
  /\bshare\s+(your|the)?\s*(otp|pin|password|details?|card)\b/i,
  /\bverification\s+code\b/i,
];

const rewardPatterns: RegExp[] = [
  /\bwon\b/i,
  /\bwinner\b/i,
  /\bcongratulations\b/i,
  /\bprize\b/i,
  /\blottery\b/i,
  /\blucky\s+(draw|winner)\b/i,
  /\breward\b/i,
  /\bgift\b/i,
  /\bclaim\s+(your|the)\s+(prize|reward|gift|winning)/i,
  /\bselected\s+for\b/i,
  /\bcashback\b/i,
];

const verificationPatterns: RegExp[] = [
  /\bverify\b/i,
  /\bverification\b/i,
  /\bconfirm\b/i,
  /\bcomplete\s+(your|the)\s+verification\b/i,
  /\bauthenticate\b/i,
  /\bupdate\s+(your|the)?\s*(details?|info|kyc)\b/i,
  /\b(kyc|ekyc)\b/i,
  /\baccount\s+(verification|update)\b/i,
];

const coercionPatterns: RegExp[] = [
  /\bif\s+you\s+(do\s+not|don'?t|fail\s+to)\b/i,
  /\botherwise\b/i,
  /\bor\s+(else|face|your)\b/i,
  /\bunless\s+you\b/i,
  /\bmandatory\b/i,
  /\bcompulsory\b/i,
  /\brequired\s+(immediately|now)\b/i,
  /\bfailure\s+to\b/i,
];

function severityFromWeight(weight: number): SignalSeverity {
  if (weight >= 3) return 'critical';
  if (weight >= 2) return 'high';
  if (weight >= 1) return 'medium';
  return 'low';
}

function computeRisk(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export function analyzeMessage(message: string): AnalysisResult {
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

  const signals: DetectedSignal[] = [];
  const matches: Record<string, number> = {};

  // --- UPI detection ---
  const upiMatch = text.match(UPI_URI_RE);
  const vpaMatch = upiMatch ? upiMatch[0].match(VPA_RE) : null;

  // --- Urgency ---
  const urgencyHits = countMatches(text, urgencyPatterns);
  if (urgencyHits > 0) {
    matches['urgency'] = urgencyHits;
    signals.push({
      category: 'urgency',
      label: 'Urgency Pressure',
      severity: severityFromWeight(urgencyHits),
      explanation:
        'Uses immediate-action language to reduce the time you have to verify the request.',
    });
  }

  // --- Threat / consequence ---
  const threatHits = countMatches(text, threatPatterns);
  if (threatHits > 0) {
    matches['threat'] = threatHits;
    signals.push({
      category: 'threat',
      label: 'Threat / Coercion',
      severity: severityFromWeight(threatHits),
      explanation:
        'Creates fear of service disconnection, account blocking or other negative consequences.',
    });
  }

  // --- Authority impersonation ---
  const authorityHits = countMatches(text, authorityPatterns);
  if (authorityHits > 0) {
    matches['authority'] = authorityHits;
    signals.push({
      category: 'authority',
      label: 'Authority Impersonation',
      severity: severityFromWeight(authorityHits),
      explanation:
        'Claims to originate from an official institution or service provider to appear credible.',
    });
  }

  // --- Payment request ---
  const paymentHits = countMatches(text, paymentPatterns);
  if (paymentHits > 0) {
    matches['payment'] = paymentHits;
    signals.push({
      category: 'payment',
      label: 'Payment Request',
      severity: severityFromWeight(paymentHits),
      explanation:
        'Requests a monetary transaction as part of the supposed verification or claim process.',
    });
  }

  // --- Credential / OTP ---
  const credHits = countMatches(text, credentialPatterns);
  if (credHits > 0) {
    matches['credential'] = credHits;
    signals.push({
      category: 'credential',
      label: 'Credential / OTP Request',
      severity: severityFromWeight(credHits),
      explanation:
        'Asks for sensitive credentials such as OTP, PIN, password or card details — never required by legitimate institutions.',
    });
  }

  // --- Suspicious UPI URI ---
  if (upiMatch) {
    matches['upi'] = 2;
    signals.push({
      category: 'upi',
      label: 'Suspicious UPI Request',
      severity: 'high',
      explanation:
        'Contains a UPI payment URI. The destination VPA should be independently verified before any payment.',
    });
  }

  // --- Reward / prize bait ---
  const rewardHits = countMatches(text, rewardPatterns);
  if (rewardHits > 0) {
    matches['reward'] = rewardHits;
    signals.push({
      category: 'reward',
      label: 'Reward / Prize Bait',
      severity: severityFromWeight(rewardHits),
      explanation:
        'Offers an unsolicited prize or reward — a common lure used to justify a follow-up payment request.',
    });
  }

  // --- Unusual verification ---
  const verifyHits = countMatches(text, verificationPatterns);
  if (verifyHits > 0) {
    matches['verification'] = verifyHits;
    signals.push({
      category: 'verification',
      label: 'Unusual Verification Request',
      severity: severityFromWeight(verifyHits),
      explanation:
        'Pushes an out-of-band verification step that legitimate providers do not usually initiate via message.',
    });
  }

  // --- Social engineering / coercion ---
  const coerceHits = countMatches(text, coercionPatterns);
  const coercionScore = coerceHits + (urgencyHits > 1 ? 1 : 0) + (threatHits > 0 ? 1 : 0);
  if (coercionScore > 0) {
    matches['coercion'] = coercionScore;
    signals.push({
      category: 'coercion',
      label: 'Social Engineering / Coercion',
      severity: severityFromWeight(coercionScore),
      explanation:
        'Combines conditional threats with urgency to pressure a hasty decision — a hallmark of social engineering.',
    });
  }

  // --- Contextual composite scoring ---
  // Score is driven by how many signal categories co-occur AND how strongly
  // each fires. A single weak signal yields a low score; several strong
  // signals together push the score high — matching real scam patterns.
  const categoryCount = signals.length;
  const totalWeight = signals.reduce((sum, s) => {
    const w =
      s.severity === 'critical'
        ? 3
        : s.severity === 'high'
        ? 2
        : s.severity === 'medium'
        ? 1.5
        : 1;
    return sum + w;
  }, 0);

  // Combo bonus: contextual co-occurrence is the strongest scam indicator.
  const comboBonus =
    categoryCount >= 4 ? 22 : categoryCount === 3 ? 14 : categoryCount === 2 ? 8 : 0;

  // UPI + payment + urgency/threat together is a very strong combo.
  const upiPaymentCombo = upiMatch && matches['payment'] && (matches['urgency'] || matches['threat']) ? 10 : 0;
  const rewardPaymentCombo = matches['reward'] && matches['payment'] ? 8 : 0;
  const credCombo = matches['credential'] && (matches['urgency'] || matches['authority']) ? 8 : 0;

  let score = Math.min(
    100,
    Math.round(totalWeight * 7 + comboBonus + upiPaymentCombo + rewardPaymentCombo + credCombo),
  );

  // A genuinely low-signal message should not be flagged.
  if (categoryCount === 0) score = 0;
  if (categoryCount === 1 && totalWeight <= 1) score = Math.min(score, 18);

  const riskLevel = computeRisk(score);
  const confidence = Math.min(98, 55 + categoryCount * 8 + Math.round(totalWeight * 2));

  // --- Context summary ---
  const parts: string[] = [];
  if (matches['urgency']) parts.push('urgency');
  if (matches['threat']) parts.push('a threat of service disruption');
  if (matches['authority']) parts.push('authority-style language');
  if (matches['payment']) parts.push('a payment request');
  if (matches['credential']) parts.push('a request for sensitive credentials');
  if (matches['reward']) parts.push('an unsolicited reward offer');
  if (matches['verification']) parts.push('an unusual verification demand');
  if (matches['coercion']) parts.push('coercive conditional language');
  if (upiMatch) parts.push('a UPI payment URI');

  const contextSummary =
    parts.length === 0
      ? 'No strong scam signals were detected. The message appears routine, but always verify unusual requests independently.'
      : `This message combines ${parts.join(', ')}. ${
          parts.length >= 3
            ? 'These signals together appear consistent with social-engineering-based payment fraud. Verify independently before taking any action.'
            : 'A few cautionary signals are present — confirm through the official provider before proceeding.'
        }`;

  // --- Recommended actions ---
  const high = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  const recommendedActions = high
    ? [
        'Do not click any links or open the UPI request.',
        'Do not share OTP, PIN, password or card details with anyone.',
        'Do not make the requested payment.',
        'Verify through the official bank or service-provider app or website directly.',
        'Report the suspicious message to your provider or the national cybercrime portal.',
      ]
    : riskLevel === 'MEDIUM'
    ? [
        'Treat the message with caution and verify the sender independently.',
        'Do not share OTP, PIN or passwords in response to a message.',
        'Use the official app or website to check your account status.',
      ]
    : [
        'The message looks routine, but always verify unexpected requests through official channels.',
        'Never share OTP, PIN or passwords in response to any message.',
      ];

  return {
    threatScore: score,
    riskLevel,
    confidence,
    signals,
    contextSummary,
    upi: {
      detected: !!upiMatch,
      vpa: vpaMatch ? vpaMatch[1] : undefined,
      uri: upiMatch ? upiMatch[0] : undefined,
      note: upiMatch
        ? 'A UPI payment URI was detected. Independently verify the destination VPA before considering any payment.'
        : '',
    },
    recommendedActions,
  };
}
