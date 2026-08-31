import Link from "next/link";
import { CheckCircle, AlertTriangle, AlertOctagon, Clock, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-medium mb-6">
        <ShieldCheck className="w-3.5 h-3.5" />
        Deterministic Deadline Risk Intelligence
      </div>

      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-text-primary mb-4">
        Due<span className="text-accent">Bro</span>
      </h1>

      <p className="text-lg text-text-secondary max-w-xl mb-8 leading-relaxed">
        See everything you owe, and know what&apos;s actually at risk, before it&apos;s too late.
      </p>

      {/* Visual demonstration of the 6 Risk Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-10 text-left">
        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-risk-on-track shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">On Track</div>
            <div className="text-[11px] text-text-secondary">Pace is optimal</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-3">
          <Clock className="w-5 h-5 text-risk-upcoming shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Upcoming</div>
            <div className="text-[11px] text-text-secondary">Due within 7 days</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-risk-needs-attention shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Needs Attention</div>
            <div className="text-[11px] text-text-secondary">Capacity tightening</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-risk-at-risk shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">At Risk</div>
            <div className="text-[11px] text-text-secondary">Clustering detected</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-risk-critical shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Critical</div>
            <div className="text-[11px] text-text-secondary">Capacity deficit</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-risk-overdue shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Overdue</div>
            <div className="text-[11px] text-text-secondary">Past deadline</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/today"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-signal-white text-void-950 font-semibold hover:bg-signal-white/95 transition-all shadow-[0_0_24px_rgba(250,250,252,0.25)]"
        >
          Open Today Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/deadlines"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-surface border border-border-default text-text-primary hover:border-border-hover hover:bg-bg-elevated transition-colors"
        >
          <Calendar className="w-4 h-4 text-text-secondary" />
          View Deadlines
        </Link>
      </div>
    </main>
  );
}
