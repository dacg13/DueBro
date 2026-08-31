"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function AppSplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isIgnited, setIsIgnited] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check session storage so it displays once per app launch session
    const hasSeenSplash = sessionStorage.getItem("duebro_splash_seen");
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Step 1: Ignite the inner checkmark light
    const igniteTimer = setTimeout(() => {
      setIsIgnited(true);
    }, 150);

    // Step 2: Weightless drift & fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 900);

    // Step 3: Remove from DOM
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("duebro_splash_seen", "true");
    }, 1350);

    return () => {
      clearTimeout(igniteTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-99999 flex flex-col items-center justify-center bg-void-950 transition-opacity duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isIgnited ? "scale-100 opacity-100" : "scale-95 opacity-0",
          isFadingOut && "-translate-y-3.5 scale-98"
        )}
      >
        {/* Floating Suspend Mark */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[24%] overflow-hidden shadow-[0_0_64px_rgba(250,250,252,0.25)] ring-1 ring-white/20 animate-pulse">
          <Image
            src="/logo.png"
            alt="DueBro"
            width={112}
            height={112}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-signal-white">
            DueBro
          </h1>
          <p className="text-xs text-mist-200 font-medium tracking-wide">
            Intelligent Student Deadline Planning
          </p>
        </div>
      </div>
    </div>
  );
}
