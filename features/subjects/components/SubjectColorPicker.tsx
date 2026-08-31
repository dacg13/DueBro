"use client";

import { ACCESSIBLE_SUBJECT_COLORS } from "@/lib/validation/subjects";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

export function SubjectColorPicker({ value, onChange, disabled }: SubjectColorPickerProps) {
  const normalizedValue = value?.toUpperCase();

  return (
    <div>
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2.5">
        {ACCESSIBLE_SUBJECT_COLORS.map((c) => {
          const isSelected = normalizedValue === c.hex.toUpperCase();

          return (
            <button
              key={c.hex}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c.hex)}
              title={c.name}
              className={cn(
                "relative w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated focus-visible:ring-accent",
                isSelected
                  ? "ring-2 ring-white scale-110 shadow-md"
                  : "hover:scale-105 opacity-85 hover:opacity-100"
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={`Select ${c.name} color`}
            >
              {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-text-tertiary mt-2">
        Colors are pre-screened for WCAG AA contrast compliance against dark surfaces.
      </p>
    </div>
  );
}
