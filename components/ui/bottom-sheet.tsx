"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 sheet-backdrop transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container — Level 3 Glass */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 w-full rounded-t-[22px] bg-void-900/95 backdrop-blur-[40px] border-t border-x border-white/18 shadow-[0_0_64px_rgba(250,250,252,0.10)] flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-250"
        )}
      >
        {/* Drag Handle indicator */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-graphite-400/40" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0">
            <h3 className="text-base font-semibold text-signal-white">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-graphite-300 hover:text-signal-white hover:bg-void-800/60 transition-colors"
              aria-label="Close sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
