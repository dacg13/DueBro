import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Due<span className="text-accent">Bro</span>
          </h1>
        </Link>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-text-secondary">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Student Deadline Intelligence</span>
        </div>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-md bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-2xl">
        {children}
      </div>

      {/* Footer text */}
      <p className="mt-8 text-center text-xs text-text-tertiary">
        &copy; {new Date().getFullYear()} DueBro. Designed for student focus.
      </p>
    </div>
  );
}
