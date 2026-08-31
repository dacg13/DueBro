export const riskTierEnum = [
  "safe",
  "low",
  "medium",
  "high",
  "critical",
  "overdue",
] as const;

export type RiskTier = (typeof riskTierEnum)[number];

export interface RiskAssessment {
  deadlineId: string;
  score: number; // Raw numerical risk score
  tier: RiskTier;
  color: string; // Hex color code
  label: string;
  effortRemainingHours: number;
  availableCapacityHours: number;
  daysRemaining: number;
  isOverdue: boolean;
  isInCluster: boolean;
  explanation: string;
}

export interface WorkloadCluster {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  deadlineIds: string[];
  totalEffortHours: number;
  deadlineCount: number;
  isTriggered: boolean;
  reason: string;
}
