export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DetectedSignal {
  category: string;
  label: string;
  severity: SignalSeverity;
  explanation: string;
}

export interface UpiDetection {
  detected: boolean;
  vpa?: string;
  uri?: string;
  note: string;
}

export interface AnalysisResult {
  threatScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  signals: DetectedSignal[];
  contextSummary: string;
  upi: UpiDetection;
  recommendedActions: string[];
}
