"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createClassGroupAction } from "@/server/actions/class-groups";
import { getFriendsListAction, type FriendWithProfile } from "@/server/actions/friends";
import { type Subject } from "@/types";
import { Loader2, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateClassGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  preselectedSubjectId?: string;
  onSuccess?: (groupId: string) => void;
}

export function CreateClassGroupDialog({
  isOpen,
  onClose,
  subjects,
  preselectedSubjectId,
  onSuccess,
}: CreateClassGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load friends and pre-fill on open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingFriends(true);
      getFriendsListAction().then((res) => {
        if (res.data) setFriends(res.data);
        setIsLoadingFriends(false);
      });

      // Pre-fill with subject info
      if (preselectedSubjectId) {
        const sub = subjects.find((s) => s.id === preselectedSubjectId);
        setSelectedSubjectId(preselectedSubjectId);
        setGroupName(sub?.name || "");
      } else {
        setSelectedSubjectId(subjects[0]?.id || "");
        setGroupName("");
      }
      setSelectedFriendIds([]);
      setErrorMsg(null);
    }
  }, [isOpen, preselectedSubjectId, subjects]);

  const toggleFriend = (userId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createClassGroupAction({
      name: groupName.trim(),
      localSubjectId: selectedSubjectId,
      friendIdsToInvite: selectedFriendIds,
    });

    if (res.success && res.data) {
      onSuccess?.(res.data.id);
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to create class group");
    }
    setIsSubmitting(false);
  };

  const activeSubjects = subjects.filter((s) => !s.archived);

  const content = (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
          {errorMsg}
        </div>
      )}

      {/* Group Name */}
      <div>
        <label htmlFor="group-name" className="block text-xs font-medium text-text-secondary mb-1.5">
          Group Name <span className="text-error">*</span>
        </label>
        <Input
          id="group-name"
          placeholder="e.g. CS101 Study Group"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          autoFocus
        />
      </div>

      {/* Subject Mapping */}
      <div>
        <label htmlFor="group-subject" className="block text-xs font-medium text-text-secondary mb-1.5">
          Your Subject for this Class <span className="text-error">*</span>
        </label>
        <Select
          id="group-subject"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          {activeSubjects.map((sub) => (
            <option key={sub.id} value={sub.id} className="bg-bg-elevated text-text-primary">
              {sub.name}
            </option>
          ))}
        </Select>
        <p className="text-[11px] text-mist-200 mt-1">
          Shared deadlines will be filed under this subject in your view.
        </p>
      </div>

      {/* Invite Friends */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          <UserPlus className="w-3 h-3 inline mr-1" />
          Invite Friends (Optional)
        </label>

        {isLoadingFriends ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-mist-200" />
          </div>
        ) : friends.length === 0 ? (
          <div className="p-3 rounded-xl bg-void-900/60 border border-white/8 text-center">
            <p className="text-xs text-mist-200">No friends to invite. Add friends first in Settings.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {friends.map(({ friendship, friend }) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => toggleFriend(friend.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer",
                  selectedFriendIds.includes(friend.id)
                    ? "bg-accent-subtle border border-accent/20"
                    : "bg-void-900/60 border border-white/8 hover:border-white/16"
                )}
              >
                <Checkbox
                  checked={selectedFriendIds.includes(friend.id)}
                  onCheckedChange={() => toggleFriend(friend.id)}
                />
                <div className="w-7 h-7 rounded-full bg-accent-subtle border border-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                  {(friend.name || friend.email)[0].toUpperCase()}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-semibold text-signal-white truncate">{friend.name || "Unknown"}</p>
                  <p className="text-[11px] text-mist-200 truncate">{friend.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/8">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !groupName.trim() || !selectedSubjectId}
          className="min-w-28 gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5" />
              Create Group
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Create Class Group">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Class Group"
      description="Form a study group for a class with your friends."
      maxWidth="md"
    >
      {content}
    </Modal>
  );
}
