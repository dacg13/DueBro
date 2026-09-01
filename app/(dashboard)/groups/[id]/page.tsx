"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getClassGroupDetailAction,
  leaveClassGroupAction,
  createSharedDeadlineAction,
  type ClassGroupDetail,
} from "@/server/actions/class-groups";
import { getFriendsListAction, type FriendWithProfile } from "@/server/actions/friends";
import { inviteFriendToGroupAction } from "@/server/actions/class-groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  ArrowLeft,
  Users,
  Plus,
  UserPlus,
  LogOut,
  Loader2,
  Calendar,
  Clock,
  type LucideIcon,
  FileText,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Presentation,
  FlaskConical,
  BookOpen,
  Upload,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deadlineTypeEnum, type DeadlineType } from "@/types";
import { getDaysRemaining } from "@/server/domain/deadlines";

const TYPE_ICONS: Record<DeadlineType, LucideIcon> = {
  assignment: FileText,
  project: FolderKanban,
  exam: GraduationCap,
  quiz: HelpCircle,
  presentation: Presentation,
  lab: FlaskConical,
  reading: BookOpen,
  submission: Upload,
  study_session: BookMarked,
  other: Clock,
};

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<ClassGroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add shared deadline dialog state
  const [isAddSharedOpen, setIsAddSharedOpen] = useState(false);
  const [sdTitle, setSdTitle] = useState("");
  const [sdType, setSdType] = useState<DeadlineType>("assignment");
  const [sdDueDate, setSdDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [sdDueTime, setSdDueTime] = useState("23:59");
  const [sdLocation, setSdLocation] = useState("");
  const [sdNotes, setSdNotes] = useState("");
  const [isSubmittingSd, setIsSubmittingSd] = useState(false);
  const [sdError, setSdError] = useState<string | null>(null);

  // Invite friend dialog
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    loadDetail();
  }, [groupId]);

  const loadDetail = async () => {
    setIsLoading(true);
    const res = await getClassGroupDetailAction(groupId);
    if (res.success && res.data) {
      setDetail(res.data);
    } else {
      setError(res.error || "Failed to load group");
    }
    setIsLoading(false);
  };

  const handleLeave = async () => {
    const confirmed = confirm("Are you sure you want to leave this group? Your existing deadlines will remain.");
    if (!confirmed) return;

    await leaveClassGroupAction(groupId);
    router.push("/subjects");
  };

  const handleCreateSharedDeadline = async () => {
    setIsSubmittingSd(true);
    setSdError(null);
    const res = await createSharedDeadlineAction({
      classGroupId: groupId,
      title: sdTitle.trim(),
      type: sdType,
      dueDate: sdDueDate,
      dueTime: sdDueTime || null,
      location: sdLocation.trim() || null,
      sharedNotes: sdNotes.trim() || null,
    });
    if (res.success) {
      setIsAddSharedOpen(false);
      setSdTitle("");
      setSdType("assignment");
      setSdDueDate(new Date().toISOString().split("T")[0]);
      setSdDueTime("23:59");
      setSdLocation("");
      setSdNotes("");
      await loadDetail();
    } else {
      setSdError(res.error || "Failed to create shared deadline");
    }
    setIsSubmittingSd(false);
  };

  const handleOpenInvite = async () => {
    setIsInviteOpen(true);
    const res = await getFriendsListAction();
    if (res.data) setFriends(res.data);
  };

  const handleInviteFriend = async (friendUserId: string) => {
    setInviteLoading(friendUserId);
    await inviteFriendToGroupAction({ classGroupId: groupId, friendUserId });
    setInviteLoading(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-mist-200" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-mist-200 hover:text-signal-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <EmptyState
          icon={Users}
          title="Group not found"
          description={error || "You may not be a member of this group."}
          actionLabel="Go to Subjects"
          onAction={() => router.push("/subjects")}
        />
      </div>
    );
  }

  // Sorted shared deadlines by due date
  const sortedSharedDeadlines = [...detail.sharedDeadlines].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Existing member IDs for filtering invite list
  const memberUserIds = new Set(detail.members.map((m) => m.userId));

  const addSharedDeadlineForm = (
    <div className="space-y-4">
      {sdError && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">{sdError}</div>
      )}

      {/* Banner */}
      <div className="p-3 rounded-xl bg-accent-subtle/30 border border-accent/15 text-xs text-accent font-medium flex items-center gap-2">
        <Users className="w-4 h-4" />
        Adding to {detail.group.name} — {detail.members.length} member{detail.members.length !== 1 ? "s" : ""} will see this
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Title <span className="text-error">*</span>
        </label>
        <Input placeholder="e.g. Problem Set 5" value={sdTitle} onChange={(e) => setSdTitle(e.target.value)} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
          <Select value={sdType} onChange={(e) => setSdType(e.target.value as DeadlineType)}>
            {deadlineTypeEnum.map((t) => (
              <option key={t} value={t} className="bg-bg-elevated text-text-primary capitalize">{t.replace("_", " ")}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Due Date <span className="text-error">*</span>
          </label>
          <Input type="date" value={sdDueDate} onChange={(e) => setSdDueDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Due Time</label>
          <Input type="time" value={sdDueTime} onChange={(e) => setSdDueTime(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Location</label>
          <Input placeholder="Room / Hall" value={sdLocation} onChange={(e) => setSdLocation(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">Shared Notes</label>
        <textarea
          rows={3}
          placeholder="Assignment guidelines, rubric points, etc."
          value={sdNotes}
          onChange={(e) => setSdNotes(e.target.value)}
          className="w-full rounded-xl bg-bg-elevated border border-border-default hover:border-border-hover focus:border-accent p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/8">
        <Button variant="ghost" onClick={() => setIsAddSharedOpen(false)} disabled={isSubmittingSd}>Cancel</Button>
        <Button onClick={handleCreateSharedDeadline} disabled={isSubmittingSd || !sdTitle.trim() || !sdDueDate} className="min-w-28">
          {isSubmittingSd ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sharing...</>
          ) : (
            "Share Deadline"
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-mist-200 hover:text-signal-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Subjects
      </button>

      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-signal-white">{detail.group.name}</h1>
            <p className="text-xs text-mist-200">
              {detail.members.length} member{detail.members.length !== 1 ? "s" : ""} · {detail.sharedDeadlines.length} shared deadline{detail.sharedDeadlines.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="secondary" onClick={handleOpenInvite} className="gap-1.5">
            <UserPlus className="w-4 h-4" />
            Invite
          </Button>
          <Button onClick={() => setIsAddSharedOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Shared Deadline
          </Button>
          <button
            type="button"
            onClick={handleLeave}
            className="p-2 rounded-lg text-graphite-300 hover:text-signal-danger hover:bg-signal-danger/10 transition-colors cursor-pointer"
            title="Leave group"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Member Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {detail.members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-graphite-600/18 border border-white/8 shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-accent-subtle border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
              {(m.userName || m.userEmail)[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium text-signal-white whitespace-nowrap">
              {m.userName || m.userEmail.split("@")[0]}
            </span>
            {m.userId === detail.group.createdByUserId && (
              <span className="text-[10px] text-mist-200 bg-void-900/60 px-1.5 py-0.5 rounded-full">Creator</span>
            )}
          </div>
        ))}
      </div>

      {/* Shared Deadlines List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-signal-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          Shared Deadlines
        </h2>

        {sortedSharedDeadlines.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No shared deadlines yet"
            description="Add a shared deadline and it'll appear for all group members automatically."
            actionLabel="Add Shared Deadline"
            onAction={() => setIsAddSharedOpen(true)}
          />
        ) : (
          <div className="space-y-2">
            {sortedSharedDeadlines.map((sd) => {
              const TypeIcon = TYPE_ICONS[sd.type] || Clock;
              const days = getDaysRemaining(sd.dueDate);
              let countdownText = "No date";
              if (days === 0) countdownText = "Due Today";
              else if (days === 1) countdownText = "Due Tomorrow";
              else if (days > 1) countdownText = `Due in ${days}d`;
              else countdownText = `${Math.abs(days)}d ago`;

              return (
                <div
                  key={sd.id}
                  className="p-4 rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 hover:border-white/16 transition-all flex items-center gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent-subtle/40 border border-accent/15 flex items-center justify-center shrink-0">
                    <TypeIcon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-signal-white truncate">{sd.title}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-mist-200 capitalize">{sd.type.replace("_", " ")}</span>
                      {sd.location && (
                        <span className="text-[11px] text-mist-200">📍 {sd.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xs font-medium",
                      days < 0 ? "text-signal-danger" : days <= 2 ? "text-warning" : "text-mist-200"
                    )}>
                      {countdownText}
                    </p>
                    {sd.dueTime && (
                      <p className="text-[11px] text-graphite-300 mt-0.5">at {sd.dueTime}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Shared Deadline Dialog */}
      {isMobile ? (
        <BottomSheet isOpen={isAddSharedOpen} onClose={() => setIsAddSharedOpen(false)} title="Add Shared Deadline">
          {addSharedDeadlineForm}
        </BottomSheet>
      ) : (
        <Modal isOpen={isAddSharedOpen} onClose={() => setIsAddSharedOpen(false)} title="Add Shared Deadline" maxWidth="md">
          {addSharedDeadlineForm}
        </Modal>
      )}

      {/* Invite Friend Dialog */}
      {isMobile ? (
        <BottomSheet isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Friends">
          <InviteFriendsContent
            friends={friends}
            memberUserIds={memberUserIds}
            inviteLoading={inviteLoading}
            onInvite={handleInviteFriend}
          />
        </BottomSheet>
      ) : (
        <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Friends to Group" maxWidth="sm">
          <InviteFriendsContent
            friends={friends}
            memberUserIds={memberUserIds}
            inviteLoading={inviteLoading}
            onInvite={handleInviteFriend}
          />
        </Modal>
      )}
    </div>
  );
}

// Sub-component for invite list
function InviteFriendsContent({
  friends,
  memberUserIds,
  inviteLoading,
  onInvite,
}: {
  friends: FriendWithProfile[];
  memberUserIds: Set<string>;
  inviteLoading: string | null;
  onInvite: (friendUserId: string) => void;
}) {
  const eligibleFriends = friends.filter((f) => !memberUserIds.has(f.friend.id));

  if (eligibleFriends.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-8 h-8 text-graphite-400 mx-auto mb-2" />
        <p className="text-xs text-mist-200">All your friends are already in this group, or you have no friends to invite.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {eligibleFriends.map(({ friend }) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-3 rounded-xl bg-void-900/60 border border-white/8"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-subtle border border-accent/20 flex items-center justify-center text-xs font-bold text-accent">
              {(friend.name || friend.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-signal-white">{friend.name || "Unknown"}</p>
              <p className="text-[11px] text-mist-200">{friend.email}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onInvite(friend.id)}
            disabled={inviteLoading === friend.id}
            className="h-7 text-[11px] gap-1"
          >
            {inviteLoading === friend.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserPlus className="w-3 h-3" />
            )}
            Invite
          </Button>
        </div>
      ))}
    </div>
  );
}
