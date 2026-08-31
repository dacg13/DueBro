"use client";

import { type WorkloadCluster } from "@/types";
import { format, parseISO } from "date-fns";
import { AlertTriangle, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClusterWarningBannerProps {
  clusters: WorkloadCluster[];
  onViewCluster?: (cluster: WorkloadCluster) => void;
}

export function ClusterWarningBanner({
  clusters,
  onViewCluster,
}: ClusterWarningBannerProps) {
  if (!clusters || clusters.length === 0) return null;

  // Render top most imminent cluster
  const activeCluster = clusters[0];
  const startFormatted = format(parseISO(activeCluster.startDate), "MMM d");
  const endFormatted = format(parseISO(activeCluster.endDate), "MMM d");

  return (
    <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 sm:p-5 text-text-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-text-primary">
              Workload Congestion Detected
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
              {startFormatted} &ndash; {endFormatted}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            {activeCluster.reason} Consider breaking these tasks into earlier study sessions to prevent cramming.
          </p>
        </div>
      </div>

      {onViewCluster && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onViewCluster(activeCluster)}
          className="shrink-0 gap-1.5 self-start sm:self-center border-warning/30 hover:bg-warning/10"
        >
          <Layers className="w-4 h-4 text-warning" />
          <span>Resolve Cluster</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
