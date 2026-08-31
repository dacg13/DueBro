import { type RiskTier } from "./risk";

export interface SubjectEffortSummary {
  subjectId: string;
  subjectName: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  totalEstimatedHours: number;
  remainingHours: number;
  completionRatePercent: number;
}

export interface RiskTierBreakdown {
  tier: RiskTier;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface StudyAnalyticsSummary {
  totalDeadlines: number;
  completedDeadlines: number;
  activeDeadlines: number;
  overdueDeadlines: number;
  completionRatePercent: number;
  onTimeRatePercent: number;
  totalEffortHours: number;
  completedEffortHours: number;
  remainingEffortHours: number;
  averageEffortPerTask: number;
  riskBreakdown: RiskTierBreakdown[];
  subjectSummaries: SubjectEffortSummary[];
}
