"use client";

import { Sliders, Clock } from "lucide-react";

interface CapacityTunerProps {
  weekdayHours: number;
  weekendHours: number;
  onChangeWeekday: (val: number) => void;
  onChangeWeekend: (val: number) => void;
}

export function CapacityTuner({
  weekdayHours,
  weekendHours,
  onChangeWeekday,
  onChangeWeekend,
}: CapacityTunerProps) {
  const weekdayMin = 1.0;
  const weekdayMax = 6.0;
  const weekdayPercent = Math.min(
    Math.max(((weekdayHours - weekdayMin) / (weekdayMax - weekdayMin)) * 100, 0),
    100
  );

  const weekendMin = 2.0;
  const weekendMax = 10.0;
  const weekendPercent = Math.min(
    Math.max(((weekendHours - weekendMin) / (weekendMax - weekendMin)) * 100, 0),
    100
  );

  return (
    <div className="rounded-2xl bg-bg-surface border border-border-default p-4 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
          <Sliders className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-xs font-bold text-text-primary">Daily Study Capacity Tuner</h4>
        <span className="text-[11px] text-text-tertiary ml-auto hidden sm:inline">
          Live algorithm recalculation
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weekday Slider */}
        <div className="space-y-2 p-3.5 rounded-xl bg-bg-elevated/60 border border-border-default hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Weekday Max Study Load
            </span>
            <span className="font-bold text-accent tabular-nums bg-accent-subtle px-2 py-0.5 rounded-md border border-accent/20">
              {weekdayHours.toFixed(1)}h / day
            </span>
          </div>
          <div className="pt-1">
            <input
              type="range"
              id="weekday-capacity-slider"
              aria-label="Weekday maximum study load in hours"
              min={weekdayMin}
              max={weekdayMax}
              step="0.5"
              value={weekdayHours}
              onChange={(e) => onChangeWeekday(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, #5B6EF5 0%, #5B6EF5 ${weekdayPercent}%, rgba(255, 255, 255, 0.1) ${weekdayPercent}%, rgba(255, 255, 255, 0.1) 100%)`,
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-tertiary tabular-nums font-medium">
            <span>1.0h</span>
            <span>3.5h</span>
            <span>6.0h</span>
          </div>
        </div>

        {/* Weekend Slider */}
        <div className="space-y-2 p-3.5 rounded-xl bg-bg-elevated/60 border border-border-default hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="weekend-capacity-slider" className="font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Weekend Max Study Load
            </label>
            <span className="font-bold text-accent tabular-nums bg-accent-subtle px-2 py-0.5 rounded-md border border-accent/20">
              {weekendHours.toFixed(1)}h / day
            </span>
          </div>
          <div className="pt-1">
            <input
              type="range"
              id="weekend-capacity-slider"
              aria-label="Weekend maximum study load in hours"
              min={weekendMin}
              max={weekendMax}
              step="0.5"
              value={weekendHours}
              onChange={(e) => onChangeWeekend(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, #5B6EF5 0%, #5B6EF5 ${weekendPercent}%, rgba(255, 255, 255, 0.1) ${weekendPercent}%, rgba(255, 255, 255, 0.1) 100%)`,
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-tertiary tabular-nums font-medium">
            <span>2.0h</span>
            <span>6.0h</span>
            <span>10.0h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
