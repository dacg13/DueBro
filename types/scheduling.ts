import { type Priority, type DeadlineType } from "./deadlines";

export interface ScheduledSessionChunk {
  id: string;
  deadlineId: string;
  title: string;
  type: DeadlineType;
  priority: Priority;
  subjectId: string | null;
  date: string; // YYYY-MM-DD
  allocatedHours: number;
  dueDate: string;
}

export interface WorkloadShortfall {
  deadlineId: string;
  title: string;
  priority: Priority;
  dueDate: string;
  requiredEffortHours: number;
  allocatedHours: number;
  shortfallHours: number;
  reason: string;
}

export interface DailyWorkloadPlan {
  date: string; // YYYY-MM-DD
  dayName: string;
  capacityHours: number;
  allocatedHours: number;
  utilizationPercent: number;
  isOverloaded: boolean;
  chunks: ScheduledSessionChunk[];
}

export interface SchedulingOptions {
  startDate?: Date;
  daysToPlan?: number; // default 14
  weekdayCapacityHours?: number; // default 2.0
  weekendCapacityHours?: number; // default 4.0
  minChunkHours?: number; // default 0.5 (30 mins)
  maxChunkHours?: number; // default 2.5 (150 mins)
}

export interface ScheduleGenerationResult {
  dailyPlans: DailyWorkloadPlan[];
  totalEffortAllocated: number;
  shortfalls: WorkloadShortfall[];
  totalShortfallHours: number;
}
