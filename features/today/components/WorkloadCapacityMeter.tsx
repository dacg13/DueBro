"use client";

import { AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkloadCapacityMeterProps {
  plannedHours: number;
  capacityHours: number;
  taskCount: number;
  className?: string;
}

export function WorkloadCapacityMeter({
  plannedHours,
  capacityHours,
  taskCount,
  className,
}: WorkloadCapacityMeterProps) {
  const percentage = capacityHours > 0 ? Math.round((plannedHours / capacityHours) * 100) : 0;
  const isOverloaded = plannedHours > capacityHours;
  const isSevere = plannedHours > capacityHours * 1.5;

  // Status configuration
  let statusColor = "text-accent";
  let barColor = "bg-accent";
  let statusBadge = "Balanced Workload";
  let StatusIcon = CheckCircle2;

  if (isSevere) {
    statusColor = "text-error";
    barColor = "bg-error";
    statusBadge = "Heavy Overload (>150%)";
    StatusIcon = Flame;
  } else if (isOverloaded) {
    statusColor = "text-warning";
    barColor = "bg-warning";
    statusBadge = "Exceeds Daily Capacity";
    StatusIcon = AlertTriangle;
  } else if (plannedHours === 0) {
    statusColor = "text-success";
    barColor = "bg-success";
    statusBadge = "All Done";
    StatusIcon = CheckCircle2;
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-bg-surface border border-border-default p-5 transition-all duration-200",
        isSevere && "border-error/30 bg-error/5",
        !isSevere && isOverloaded && "border-warning/30 bg-warning/5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">Today&apos;s Study Load</h3>
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 border",
                isSevere && "bg-error/15 text-error border-error/30",
                !isSevere && isOverloaded && "bg-warning/15 text-warning border-warning/30",
                !isOverloaded && "bg-accent-subtle text-accent border-accent/20"
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {statusBadge}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {taskCount} focus task{taskCount === 1 ? "" : "s"} scheduled for today
          </p>
        </div>

        {/* Numeric Readout */}
        <div className="text-right">
          <div className="text-xl font-bold tracking-tight text-text-primary tabular-nums">
            <span className={statusColor}>{plannedHours.toFixed(1)}h</span>
            <span className="text-text-tertiary text-sm font-normal"> / {capacityHours.toFixed(1)}h cap</span>
          </div>
          <div className="text-[11px] text-text-tertiary tabular-nums font-medium">
            {percentage}% capacity utilization
          </div>
        </div>
      </div>

      {/* Capacity Progress Bar with 100% threshold marker */}
      <div className="space-y-1.5">
        <div className="relative h-2.5 w-full bg-bg-elevated rounded-full overflow-hidden border border-border-default">
          <div
            className={cn("h-full transition-all duration-300 rounded-full", barColor)}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        {isOverloaded && (
          <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1">
            <span className="flex items-center gap-1 text-warning font-medium">
              <AlertTriangle className="w-3 h-3" />
              Over capacity by {(plannedHours - capacityHours).toFixed(1)} hours
            </span>
            <span>Tip: Start high-risk tasks early</span>
          </div>
        )}
      </div>
    </div>
  );
}
