"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sendFriendRequestAction,
  respondFriendRequestAction,
  getFriendsListAction,
  getPendingFriendRequestsAction,
  blockFriendAction,
  removeFriendAction,
  type FriendWithProfile,
} from "@/server/actions/friends";
import { UserPlus, Users, Inbox, Send, Check, X, Shield, UserMinus, Loader2, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FriendsManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "friends" | "requests" | "search";

export function FriendsManagerDialog({ isOpen, onClose }: FriendsManagerDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [incoming, setIncoming] = useState<FriendWithProfile[]>([]);
  const [outgoing, setOutgoing] = useState<FriendWithProfile[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    const [friendsRes, pendingRes] = await Promise.all([
      getFriendsListAction(),
      getPendingFriendRequestsAction(),
    ]);
    if (friendsRes.data) setFriends(friendsRes.data);
    if (pendingRes.data) {
      setIncoming(pendingRes.data.incoming);
      setOutgoing(pendingRes.data.outgoing);
    }
    setIsLoading(false);
  };

  const handleSendRequest = async () => {
    if (!searchEmail.trim()) return;
    setActionLoading("send");
    setMessage(null);
    const res = await sendFriendRequestAction({ targetEmail: searchEmail.trim() });
    if (res.success) {
      setMessage({ type: "success", text: "Friend request sent!" });
      setSearchEmail("");
      await loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to send request" });
    }
    setActionLoading(null);
  };

  const handleRespond = async (friendshipId: string, response: "accepted" | "declined") => {
    setActionLoading(friendshipId);
    await respondFriendRequestAction({ friendshipId, response });
    await loadData();
    setActionLoading(null);
  };

  const handleBlock = async (friendshipId: string) => {
    setActionLoading(`block-${friendshipId}`);
    await blockFriendAction({ friendshipId });
    await loadData();
    setActionLoading(`block-${friendshipId}`);
  };

  const handleRemove = async (friendshipId: string) => {
    setActionLoading(`remove-${friendshipId}`);
    await removeFriendAction({ friendshipId });
    await loadData();
    setActionLoading(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "friends", label: "Friends", icon: <Users className="w-3.5 h-3.5" />, count: friends.length },
    { id: "requests", label: "Requests", icon: <Inbox className="w-3.5 h-3.5" />, count: incoming.length },
    { id: "search", label: "Add Friend", icon: <UserPlus className="w-3.5 h-3.5" /> },
  ];

  const content = (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-void-900/60 border border-white/8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setMessage(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === tab.id
                ? "bg-accent-subtle text-accent border border-accent/20"
                : "text-mist-200 hover:text-signal-white"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      {message && (
        <div className={cn(
          "p-3 rounded-xl text-xs font-medium border",
          message.type === "success"
            ? "bg-signal-white/10 border-white/20 text-signal-white"
            : "bg-error/10 border-error/20 text-error"
        )}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-mist-200" />
        </div>
      ) : (
        <>
          {/* Friends List Tab */}
          {activeTab === "friends" && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-graphite-400 mx-auto mb-2" />
                  <p className="text-xs text-mist-200">No friends yet. Send a request to get started!</p>
                </div>
              ) : (
                friends.map(({ friendship, friend }) => (
                  <div
                    key={friendship.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-void-900/60 border border-white/8 hover:border-white/16 transition-colors"
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleRemove(friendship.id)}
                        disabled={actionLoading === `remove-${friendship.id}`}
                        className="p-1.5 rounded-lg text-graphite-300 hover:text-signal-white hover:bg-void-800/60 transition-colors cursor-pointer"
                        title="Remove friend"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBlock(friendship.id)}
                        disabled={actionLoading === `block-${friendship.id}`}
                        className="p-1.5 rounded-lg text-graphite-300 hover:text-signal-danger hover:bg-signal-danger/10 transition-colors cursor-pointer"
                        title="Block"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {incoming.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-mist-200 uppercase tracking-wider">Incoming</h4>
                  {incoming.map(({ friendship, friend }) => (
                    <div
                      key={friendship.id}
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
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleRespond(friendship.id, "accepted")}
                          disabled={actionLoading === friendship.id}
                          className="h-7 text-[11px] gap-1"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleRespond(friendship.id, "declined")}
                          disabled={actionLoading === friendship.id}
                          className="p-1.5 rounded-lg text-graphite-300 hover:text-signal-danger hover:bg-signal-danger/10 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {outgoing.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-mist-200 uppercase tracking-wider">Sent</h4>
                  {outgoing.map(({ friendship, friend }) => (
                    <div
                      key={friendship.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-void-900/60 border border-white/8"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-graphite-600/40 border border-white/10 flex items-center justify-center text-xs font-bold text-mist-200">
                          {(friend.name || friend.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-signal-white">{friend.name || "Unknown"}</p>
                          <p className="text-[11px] text-mist-200">Pending...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {incoming.length === 0 && outgoing.length === 0 && (
                <div className="text-center py-8">
                  <Inbox className="w-8 h-8 text-graphite-400 mx-auto mb-2" />
                  <p className="text-xs text-mist-200">No pending requests</p>
                </div>
              )}
            </div>
          )}

          {/* Search / Add Friend Tab */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Friend&apos;s Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="friend@university.edu"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                  />
                  <Button
                    onClick={handleSendRequest}
                    disabled={!searchEmail.trim() || actionLoading === "send"}
                    className="shrink-0 gap-1.5"
                  >
                    {actionLoading === "send" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-mist-200">
                Enter the email address of a classmate who uses DueBro. They&apos;ll receive a friend request to accept.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Friends & Study Network">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Friends & Study Network"
      description="Add friends to create class groups and share deadlines."
      maxWidth="md"
    >
      {content}
    </Modal>
  );
}
