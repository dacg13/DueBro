"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { respondGroupInviteAction } from "@/server/actions/class-groups";
import { type Subject } from "@/types";
import { type PendingGroupInvite } from "@/server/actions/class-groups";
import { Loader2, Users, Check, X, BookOpen } from "lucide-react";

interface AcceptInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invite: PendingGroupInvite | null;
  subjects: Subject[];
  onSuccess?: () => void;
}

export function AcceptInviteDialog({
  isOpen,
  onClose,
  invite,
  subjects,
  onSuccess,
}: AcceptInviteDialogProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedSubjectId(subjects.filter((s) => !s.archived)[0]?.id || "");
      setErrorMsg(null);
    }
  }, [isOpen, subjects]);

  if (!invite) return null;

  const handleAccept = async () => {
    if (!selectedSubjectId) {
      setErrorMsg("Please select a subject to map this class group to.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await respondGroupInviteAction({
      inviteId: invite.invite.id,
      response: "accepted",
      localSubjectId: selectedSubjectId,
    });

    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to accept invite");
    }
    setIsSubmitting(false);
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    await respondGroupInviteAction({
      inviteId: invite.invite.id,
      response: "declined",
    });
    onSuccess?.();
    onClose();
    setIsSubmitting(false);
  };

  const activeSubjects = subjects.filter((s) => !s.archived);

  const content = (
    <div className="space-y-5">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
          {errorMsg}
        </div>
      )}

      {/* Invite Info Card */}
      <div className="p-4 rounded-xl bg-void-900/60 border border-white/8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-signal-white">{invite.groupName}</h4>
            <p className="text-[11px] text-mist-200">
              Invited by {invite.invitedByName || "a classmate"} · {invite.memberCount} member{invite.memberCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Mapping — MANDATORY on accept (Fix #1) */}
      <div className="p-4 rounded-xl bg-accent-subtle/30 border border-accent/15 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <label htmlFor="invite-subject" className="text-xs font-semibold text-signal-white">
            Which of your subjects is this class? <span className="text-error">*</span>
          </label>
        </div>
        <Select
          id="invite-subject"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          <option value="" className="bg-bg-elevated text-text-primary">Select a subject...</option>
          {activeSubjects.map((sub) => (
            <option key={sub.id} value={sub.id} className="bg-bg-elevated text-text-primary">
              {sub.name}
            </option>
          ))}
        </Select>
        <p className="text-[11px] text-mist-200">
          Shared deadlines from this group will appear under the subject you choose. You can change this later.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/8">
        <button
          type="button"
          onClick={handleDecline}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-graphite-300 hover:text-signal-danger hover:bg-signal-danger/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Decline
        </button>
        <Button
          onClick={handleAccept}
          disabled={isSubmitting || !selectedSubjectId}
          className="min-w-28 gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              Accept & Join
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Class Group Invite">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Class Group Invite"
      description="Map this class to one of your subjects to start receiving shared deadlines."
      maxWidth="sm"
    >
      {content}
    </Modal>
  );
}
