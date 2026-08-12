import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, MessageSquare, Heart, Plus, Search, Circle, Send, X,
  CheckCheck, MessageCircle, RefreshCw, UserCheck, UserPlus, Hash,
  UsersRound, Loader2, Trash2, Lock, Globe, Sparkles, ChevronRight,
  MessageSquarePlus
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/community")({
  component: CommunityPage,
});

/* ─────────────────────────── Types ─────────────────────────── */

interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  author_initials: string;
  content: string;
  likes: number;
  created_at: string;
  likedByMe?: boolean;
}

interface ClassmateMember {
  id: string;
  name: string;
  initials: string;
  department: string;
  activity: string;
  status: "online" | "offline";
}

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  created_by: string;
  memberCount?: number;
  isMember?: boolean;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function getInitials(name: string): string {
  if (!name) return "ST";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function avatarColor(initials: string) {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-red-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
    "from-lime-500 to-green-600",
  ];
  const code = initials ? initials.charCodeAt(0) : 0;
  return colors[code % colors.length];
}

function timeAgo(iso: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dataChanged(prev: DirectMessage[], next: DirectMessage[]) {
  if (prev.length !== next.length) return true;
  if (prev.length > 0 && next.length > 0) {
    if (prev[prev.length - 1].id !== next[next.length - 1].id) return true;
  }
  return false;
}

/* ─────────────────────────── Component ─────────────────────────── */

type MainTab = "global" | "dms";
type RightPanel = "members" | "groups";

function CommunityPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  /* Main Navigation Mode: Global Community vs Direct Messages */
  const [mainTab, setMainTab] = useState<MainTab>("global");

  /* Posts */
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  /* Classmates presence */
  const [members, setMembers] = useState<ClassmateMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [memberFilter, setMemberFilter] = useState<"all" | "online" | "offline">("all");
  const [memberSearch, setMemberSearch] = useState("");

  /* Right panel */
  const [rightPanel, setRightPanel] = useState<RightPanel>("members");

  /* Groups */
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [groupSubmitting, setGroupSubmitting] = useState(false);

  /* Direct Messages — Active Conversations & Unread Tracking */
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);
  const [dmLoading, setDmLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [dmSending, setDmSending] = useState(false);

  /* Active DM Conversation Peer IDs & Recent Message Details + Unread Counts */
  const [activePeerIds, setActivePeerIds] = useState<string[]>([]);
  const [recentDmMap, setRecentDmMap] = useState<Record<string, { lastMessage: string; lastMessageAt: string; unreadCount: number }>>({});
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

  /* Refs for latest state in realtime callbacks */
  const chatEndRef = useRef<HTMLDivElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const activePeerIdRef = useRef<string | null>(null);
  useEffect(() => { activePeerIdRef.current = activePeerId; }, [activePeerId]);

  const mainTabRef = useRef<MainTab>("global");
  useEffect(() => { mainTabRef.current = mainTab; }, [mainTab]);

  /* ── Bootstrap: get current user ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  /* ── Fetch ALL classmate profiles via DB function ── */
  const fetchProfiles = async () => {
    setMembersLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_all_students");
      if (error) { console.error("Error fetching students:", error); return; }
      if (data) {
        const mapped: ClassmateMember[] = data.map((p: any) => ({
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "Student",
          initials: getInitials(p.full_name || p.email?.split("@")[0] || "ST"),
          department: p.degree || "Computer Science",
          activity: p.target_role ? `Goal: ${p.target_role}` : "Active Student",
          status: "offline" as const,
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => { if (currentUser) fetchProfiles(); }, [currentUser?.id]);

  /* ── Realtime Presence ── */
  useEffect(() => {
    if (!currentUser?.id) return;
    const room = supabase.channel("community-presence", {
      config: { presence: { key: currentUser.id } },
    });
    const syncPresence = () => {
      const state = room.presenceState();
      const onlineSet = new Set<string>();
      Object.keys(state).forEach((key) => {
        onlineSet.add(key);
        const presences = state[key] as any[];
        presences?.forEach((p) => { if (p.user_id) onlineSet.add(p.user_id); });
      });
      setOnlineUserIds(onlineSet);
    };
    room
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await room.track({ user_id: currentUser.id, online_at: new Date().toISOString() });
        }
      });
    return () => { supabase.removeChannel(room); };
  }, [currentUser?.id]);

  /* ── Fetch all recent DM conversations for logged-in user ── */
  const fetchRecentConversations = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      // 1. Primary lookup: direct_messages table
      let { data: dms, error: dmError } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

      // Fallback: private_messages table
      if (dmError || !dms || dms.length === 0) {
        const { data: pms } = await supabase
          .from("private_messages")
          .select("*")
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order("created_at", { ascending: false });
        dms = pms || [];
      }

      const convMap: Record<string, { lastMessage: string; lastMessageAt: string; unreadCount: number }> = {};
      const peerOrder: string[] = [];

      const getReadTime = (peerId: string): number => {
        const val = localStorage.getItem(`acadsphere_dm_read_${currentUser.id}_${peerId}`);
        return val ? new Date(val).getTime() : 0;
      };

      for (const msg of dms || []) {
        const peerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        if (!peerOrder.includes(peerId)) peerOrder.push(peerId);

        if (!convMap[peerId]) {
          convMap[peerId] = {
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unreadCount: 0,
          };
        }

        // Count unread incoming messages received after stored read timestamp
        const isIncoming = msg.receiver_id === currentUser.id;
        const readTime = getReadTime(peerId);
        const msgTime = new Date(msg.created_at).getTime();

        if (isIncoming && msgTime > readTime && (activePeerIdRef.current !== peerId || mainTabRef.current !== "dms")) {
          convMap[peerId].unreadCount += 1;
        }
      }

      setRecentDmMap(convMap);
      setActivePeerIds(peerOrder);
    } catch (err) {
      console.error("Failed to load recent DM conversations:", err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) fetchRecentConversations();
  }, [currentUser?.id, fetchRecentConversations]);

  /* ── Open Chat with a Peer & Mark as Read ── */
  const openChatWithPeer = (peerId: string) => {
    setActivePeerId(peerId);
    setMainTab("dms");
    setActivePeerIds((prev) => [peerId, ...prev.filter((id) => id !== peerId)]);

    if (currentUser?.id) {
      const nowStr = new Date().toISOString();
      localStorage.setItem(`acadsphere_dm_read_${currentUser.id}_${peerId}`, nowStr);
      setRecentDmMap((prev) => ({
        ...prev,
        [peerId]: {
          ...(prev[peerId] || { lastMessage: "", lastMessageAt: nowStr }),
          unreadCount: 0,
        },
      }));
    }
  };

  /* ── Fetch community posts ── */
  const fetchPosts = useCallback(async (uid?: string) => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const userId = uid || currentUser?.id;
      let likedPostIds = new Set<string>();
      if (userId) {
        const { data: likeData } = await supabase
          .from("community_post_likes").select("post_id").eq("user_id", userId);
        if (likeData) likedPostIds = new Set(likeData.map((l: any) => l.post_id));
      }
      const mapped: CommunityPost[] = (data || []).map((p: any) => ({
        id: p.id, user_id: p.user_id,
        author_name: p.author_name || "", author_initials: p.author_initials || "",
        content: p.content, likes: p.likes || 0, created_at: p.created_at,
        likedByMe: likedPostIds.has(p.id),
      }));
      setPosts(mapped);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      toast.error("Could not refresh posts — showing cached feed");
    } finally {
      setPostsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { if (currentUser?.id) fetchPosts(currentUser.id); }, [currentUser?.id]);

  /* ── Realtime: community posts ── */
  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase
      .channel("community-posts-realtime-v6")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" },
        (payload) => {
          const p = payload.new as any;
          const newPost: CommunityPost = {
            id: p.id, user_id: p.user_id, author_name: p.author_name || "",
            author_initials: p.author_initials || "", content: p.content,
            likes: p.likes || 0, created_at: p.created_at, likedByMe: false,
          };
          setPosts((prev) => {
            if (prev.some((x) => x.id === newPost.id)) return prev;
            return [...prev, newPost];
          });
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "community_posts" },
        (payload) => {
          const p = payload.new as any;
          setPosts((prev) => prev.map((post) =>
            post.id === p.id ? { ...post, likes: p.likes ?? post.likes, content: p.content ?? post.content } : post
          ));
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "community_posts" },
        (payload) => {
          const p = payload.old as any;
          setPosts((prev) => prev.filter((post) => post.id !== p.id));
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_post_likes" },
        (payload) => {
          const p = payload.new as any;
          setPosts((prev) => prev.map((post) =>
            post.id === p.post_id ? { ...post, likes: post.likes + 1, likedByMe: p.user_id === currentUser.id ? true : post.likedByMe } : post
          ));
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "community_post_likes" },
        (payload) => {
          const p = payload.old as any;
          setPosts((prev) => prev.map((post) =>
            post.id === p.post_id ? { ...post, likes: Math.max(0, post.likes - 1), likedByMe: p.user_id === currentUser.id ? false : post.likedByMe } : post
          ));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  /* ── Fetch DM conversation messages for active peer ── */
  const fetchDMs = useCallback(async (peerId: string) => {
    if (!currentUser?.id) return;
    setDmLoading(true);
    try {
      let { data: dmData, error: dmError } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${currentUser.id})`)
        .order("created_at", { ascending: true });

      if (!dmError && dmData && dmData.length > 0) {
        setDmMessages(dmData);
        return;
      }

      const { data: pmData, error: pmError } = await supabase
        .from("private_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${currentUser.id})`)
        .order("created_at", { ascending: true });

      if (!pmError && pmData) {
        setDmMessages(pmData);
        return;
      }

      setDmMessages(dmData || []);
    } catch (err) {
      console.error("Failed to load DMs:", err);
      toast.error("Could not load direct messages");
    } finally {
      setDmLoading(false);
    }
  }, [currentUser?.id]);

  /* ── Load DMs when active peer changes & mark as read ── */
  useEffect(() => {
    if (activePeerId && currentUser?.id) {
      fetchDMs(activePeerId);
      // Mark conversation read
      const nowStr = new Date().toISOString();
      localStorage.setItem(`acadsphere_dm_read_${currentUser.id}_${activePeerId}`, nowStr);
      setRecentDmMap((prev) => ({
        ...prev,
        [activePeerId]: {
          ...(prev[activePeerId] || { lastMessage: "", lastMessageAt: nowStr }),
          unreadCount: 0,
        },
      }));
    } else {
      setDmMessages([]);
    }
  }, [activePeerId, currentUser?.id, fetchDMs]);

  /* ── TRIPLE-REDUNDANT REALTIME ENGINE: Broadcast + postgres_changes ── */
  useEffect(() => {
    if (!currentUser?.id) return;

    const handleNewMessage = (msg: DirectMessage) => {
      const peerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;

      // Bring peer to top of conversation list
      setActivePeerIds((prev) => [peerId, ...prev.filter((id) => id !== peerId)]);

      const isIncoming = msg.receiver_id === currentUser.id;
      const isCurrentChatOpen = activePeerIdRef.current === peerId;

      if (isCurrentChatOpen) {
        setDmMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        localStorage.setItem(`acadsphere_dm_read_${currentUser.id}_${peerId}`, new Date().toISOString());
      }

      setRecentDmMap((prev) => {
        const currentUnread = prev[peerId]?.unreadCount || 0;
        const newUnread = isIncoming && !isCurrentChatOpen ? currentUnread + 1 : 0;
        return {
          ...prev,
          [peerId]: {
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unreadCount: newUnread,
          },
        };
      });

      if (isIncoming && !isCurrentChatOpen) {
        const senderName = members.find((m) => m.id === msg.sender_id)?.name || "Classmate";
        toast.info(`Message from ${senderName}`, {
          description: msg.content.slice(0, 45) + (msg.content.length > 45 ? "..." : ""),
          action: {
            label: "Open Chat",
            onClick: () => openChatWithPeer(msg.sender_id),
          },
        });
      }
    };

    // 1. Dedicated Supabase Broadcast channel for instant peer-to-peer WebSocket delivery
    const myChannel = supabase.channel(`dm-peer-${currentUser.id}`);
    myChannel
      .on("broadcast", { event: "new_dm_message" }, (payload) => {
        if (payload?.payload) {
          handleNewMessage(payload.payload as DirectMessage);
        }
      })
      .subscribe();

    // 2. Postgres changes fallback
    const dbChannel = supabase
      .channel("custom-dm-channel-v6")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => handleNewMessage(payload.new as DirectMessage)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "private_messages" },
        (payload) => handleNewMessage(payload.new as DirectMessage)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "direct_messages" },
        (payload) => {
          const p = payload.old as any;
          setDmMessages((prev) => prev.filter((m) => m.id !== p.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(myChannel);
      supabase.removeChannel(dbChannel);
    };
  }, [currentUser?.id, members]);

  /* ── Quiet 2.5s Polling Fallback for active DM chat (zero miss guarantee) ── */
  useEffect(() => {
    if (!activePeerId || !currentUser?.id) return;

    const fetchNewestDMs = async () => {
      try {
        let { data: dmData } = await supabase
          .from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activePeerId}),and(sender_id.eq.${activePeerId},receiver_id.eq.${currentUser.id})`)
          .order("created_at", { ascending: true });

        if (!dmData || dmData.length === 0) {
          const { data: pmData } = await supabase
            .from("private_messages")
            .select("*")
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activePeerId}),and(sender_id.eq.${activePeerId},receiver_id.eq.${currentUser.id})`)
            .order("created_at", { ascending: true });
          dmData = pmData;
        }

        if (dmData && dmData.length > 0) {
          setDmMessages((prev) => {
            if (dataChanged(prev, dmData)) {
              return dmData;
            }
            return prev;
          });

          const lastMsg = dmData[dmData.length - 1];
          setRecentDmMap((prev) => ({
            ...prev,
            [activePeerId]: {
              lastMessage: lastMsg.content,
              lastMessageAt: lastMsg.created_at,
              unreadCount: 0,
            },
          }));
        }
      } catch (_) {}
    };

    const interval = setInterval(fetchNewestDMs, 2500);
    return () => clearInterval(interval);
  }, [activePeerId, currentUser?.id]);

  /* ── Fetch groups ── */
  const fetchGroups = async () => {
    if (!currentUser?.id) return;
    setGroupsLoading(true);
    try {
      const { data: groupData, error } = await supabase
        .from("community_groups").select("*, community_group_members(user_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped: Group[] = (groupData || []).map((g: any) => ({
        id: g.id, name: g.name, description: g.description || "", created_by: g.created_by,
        memberCount: g.community_group_members?.length || 0,
        isMember: g.community_group_members?.some((m: any) => m.user_id === currentUser?.id),
      }));
      setGroups(mapped);
    } catch (err) { console.error("Failed to load groups:", err); }
    finally { setGroupsLoading(false); }
  };

  useEffect(() => { if (currentUser?.id && rightPanel === "groups") fetchGroups(); }, [currentUser?.id, rightPanel]);

  /* ── Auto-scroll ── */
  useEffect(() => { feedEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [posts.length]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [dmMessages.length, activePeerId]);

  /* ── Derived data ── */
  const membersWithPresence = useMemo(() =>
    members.map((m) => ({ ...m, status: onlineUserIds.has(m.id) ? ("online" as const) : ("offline" as const) })),
    [members, onlineUserIds]
  );

  const onlineMembersCount = useMemo(() => {
    const classOnline = membersWithPresence.filter((m) => m.status === "online").length;
    return Math.max(onlineUserIds.size, classOnline + (currentUser ? 1 : 0));
  }, [membersWithPresence, onlineUserIds, currentUser]);

  /* FILTER 1: Members for Direct Messages sidebar — ONLY show active conversation peers! */
  const conversationMembers = useMemo(() => {
    const activeSet = new Set(activePeerIds);
    const list = membersWithPresence.filter((m) => m.id !== currentUser?.id && activeSet.has(m.id));

    return list.sort((a, b) => {
      const idxA = activePeerIds.indexOf(a.id);
      const idxB = activePeerIds.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [membersWithPresence, activePeerIds, currentUser]);

  const filteredConversationMembers = useMemo(() => {
    if (!memberSearch.trim()) return conversationMembers;
    const q = memberSearch.toLowerCase();
    return conversationMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        (recentDmMap[m.id]?.lastMessage || "").toLowerCase().includes(q)
    );
  }, [conversationMembers, memberSearch, recentDmMap]);

  /* FILTER 2: Members for Global Community Right Sidebar (all classmates) */
  const filteredMembers = useMemo(() => {
    const result = membersWithPresence.filter((m) => {
      if (memberFilter === "online" && m.status !== "online") return false;
      if (memberFilter === "offline" && m.status !== "offline") return false;
      if (memberSearch.trim()) {
        const q = memberSearch.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q);
      }
      return true;
    });
    return result.sort((a, b) => {
      if (a.status === b.status) return a.name.localeCompare(b.name);
      return a.status === "online" ? -1 : 1;
    });
  }, [membersWithPresence, memberFilter, memberSearch]);

  /* FILTER 3: All classmates list for + New Chat Modal */
  const allClassmatesForNewChat = useMemo(() => {
    const list = membersWithPresence.filter((m) => m.id !== currentUser?.id);
    if (!newChatSearch.trim()) return list;
    const q = newChatSearch.toLowerCase();
    return list.filter((m) => m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q));
  }, [membersWithPresence, newChatSearch, currentUser]);

  /* Total Unread DM Count across all conversations */
  const totalUnreadCount = useMemo(() => {
    return Object.values(recentDmMap).reduce((sum, item) => sum + (item.unreadCount || 0), 0);
  }, [recentDmMap]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((p) => p.content.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q));
  }, [posts, search]);

  const activePeer = useMemo(() =>
    activePeerId ? membersWithPresence.find((m) => m.id === activePeerId) || null : null,
    [membersWithPresence, activePeerId]
  );

  /* ── Actions ── */
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || !currentUser) return;
    setPostSubmitting(true);
    const authorName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Student";
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticPost: CommunityPost = {
      id: optimisticId, user_id: currentUser.id, author_name: authorName,
      author_initials: getInitials(authorName), content: newPostText.trim(),
      likes: 0, created_at: new Date().toISOString(), likedByMe: false,
    };
    setPosts((prev) => [...prev, optimisticPost]);
    setNewPostText("");
    try {
      const { data, error } = await supabase.from("community_posts").insert({
        user_id: currentUser.id, author_name: authorName,
        author_initials: getInitials(authorName), content: optimisticPost.content, likes: 0,
      }).select().single();
      if (error) throw error;
      setPosts((prev) => prev.map((p) => (p.id === optimisticId ? { ...optimisticPost, id: data.id, created_at: data.created_at } : p)));
      toast.success("Post published!");
    } catch (err: any) {
      setPosts((prev) => prev.filter((p) => p.id !== optimisticId));
      toast.error("Failed to post: " + (err.message || "Unknown error"));
    } finally { setPostSubmitting(false); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from("community_posts").delete().eq("id", postId).eq("user_id", currentUser.id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (err: any) {
      toast.error("Could not delete post: " + (err.message || ""));
    }
  };

  const handleLike = async (post: CommunityPost) => {
    if (!currentUser) return;
    try {
      if (post.likedByMe) {
        await supabase.from("community_post_likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id);
        await supabase.from("community_posts").update({ likes: Math.max(0, post.likes - 1) }).eq("id", post.id);
      } else {
        await supabase.from("community_post_likes").insert({ post_id: post.id, user_id: currentUser.id });
        await supabase.from("community_posts").update({ likes: post.likes + 1 }).eq("id", post.id);
      }
    } catch (err) { console.error("Like error:", err); }
  };

  /* Send DM to direct_messages table & broadcast to recipient's WebSocket channel */
  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activePeerId || !currentUser) return;
    setDmSending(true);
    const content = chatInput.trim();
    setChatInput("");
    const nowIso = new Date().toISOString();

    const optimisticMsg: DirectMessage = {
      id: `opt-${Date.now()}`, sender_id: currentUser.id,
      receiver_id: activePeerId, content, created_at: nowIso,
    };
    setDmMessages((prev) => [...prev, optimisticMsg]);

    setRecentDmMap((prev) => ({
      ...prev,
      [activePeerId]: {
        lastMessage: content,
        lastMessageAt: nowIso,
        unreadCount: 0,
      },
    }));

    try {
      let insertedMsg: DirectMessage | null = null;
      const { data, error } = await supabase.from("direct_messages").insert({
        sender_id: currentUser.id, receiver_id: activePeerId, content,
      }).select().single();

      if (error) {
        const { data: pmData, error: pmError } = await supabase.from("private_messages").insert({
          sender_id: currentUser.id, receiver_id: activePeerId, content,
        }).select().single();
        if (pmError) throw error;
        insertedMsg = pmData;
      } else {
        insertedMsg = data;
      }

      if (insertedMsg) {
        setDmMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? insertedMsg! : m)));

        // Broadcast to recipient via WebSocket channel for instant 0ms delivery
        const recipientChannel = supabase.channel(`dm-peer-${activePeerId}`);
        recipientChannel.send({
          type: "broadcast",
          event: "new_dm_message",
          payload: insertedMsg,
        });
      }
    } catch (err: any) {
      setDmMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setChatInput(content);
      toast.error("Failed to send message: " + (err.message || ""));
    } finally { setDmSending(false); }
  };

  const handleDeleteDM = async (msgId: string) => {
    try {
      await supabase.from("direct_messages").delete().eq("id", msgId).eq("sender_id", currentUser.id);
      await supabase.from("private_messages").delete().eq("id", msgId).eq("sender_id", currentUser.id);
      setDmMessages((prev) => prev.filter((m) => m.id !== msgId));
      toast.success("Message deleted");
    } catch {
      toast.error("Could not delete message");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;
    setGroupSubmitting(true);
    try {
      const { data, error } = await supabase.from("community_groups").insert({
        name: newGroupName.trim(), description: newGroupDesc.trim(), created_by: currentUser.id,
      }).select().single();
      if (error) throw error;
      await supabase.from("community_group_members").insert({ group_id: data.id, user_id: currentUser.id });
      toast.success(`Group "${newGroupName}" created!`);
      setNewGroupName(""); setNewGroupDesc(""); setShowCreateGroup(false);
      fetchGroups();
    } catch (err: any) { toast.error("Failed to create group: " + (err.message || "")); }
    finally { setGroupSubmitting(false); }
  };

  const handleJoinGroup = async (groupId: string, isMember: boolean) => {
    if (!currentUser) return;
    try {
      if (isMember) {
        await supabase.from("community_group_members").delete().eq("group_id", groupId).eq("user_id", currentUser.id);
        toast.success("Left group");
      } else {
        await supabase.from("community_group_members").insert({ group_id: groupId, user_id: currentUser.id });
        toast.success("Joined group!");
      }
      fetchGroups();
    } catch (err: any) { toast.error(err.message || "Error updating group membership"); }
  };

  /* ─────────────────────────── Render ─────────────────────────── */

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200 relative">

        {/* Header with Mode Toggle: Global Community vs Direct Messages */}
        <div className="relative overflow-hidden px-6 py-3.5 border-b border-border shrink-0 bg-card">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-background to-rose-500/5 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">Community Forum</h1>
                <p className="text-[10px] text-muted-foreground">
                  Shared class feed · Real-time 1-on-1 Direct Messaging
                </p>
              </div>
            </div>

            {/* Central Navigation Pills: Global vs Direct Messages */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border">
              <button
                onClick={() => setMainTab("global")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  mainTab === "global"
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-pink-500" />
                <span>Global Community</span>
              </button>

              <button
                onClick={() => setMainTab("dms")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 relative ${
                  mainTab === "dms"
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                <span>Direct Messages</span>
                {totalUnreadCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs animate-pulse">
                    {totalUnreadCount}
                  </span>
                ) : (
                  conversationMembers.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-primary/10 text-primary">
                      {conversationMembers.length}
                    </span>
                  )
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                {onlineMembersCount} Online
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => { fetchProfiles(); fetchPosts(currentUser?.id); fetchRecentConversations(); if (activePeerId) fetchDMs(activePeerId); }}
                className="h-7 text-[10px] gap-1 px-2.5" title="Refresh"
              >
                <RefreshCw className={`h-3 w-3 ${membersLoading ? "animate-spin" : ""}`} />
                Sync
              </Button>
            </div>
          </div>
        </div>

        {/* ── MODE 1: GLOBAL COMMUNITY VIEW ── */}
        {mainTab === "global" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Center: Community Feed */}
            <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10">

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text" placeholder="Search posts or authors..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Post Composer */}
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-4">
                  <form onSubmit={handlePost} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(getInitials(currentUser?.user_metadata?.full_name || "You"))} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1`}>
                        {getInitials(currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "You")}
                      </div>
                      <Textarea
                        placeholder="Share notes, ask a question, or post a tip to your class..."
                        value={newPostText} onChange={(e) => setNewPostText(e.target.value)}
                        className="flex-1 h-20 text-xs bg-muted/40 border-border resize-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={postSubmitting || !newPostText.trim()}
                        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs h-8 px-5 shadow-sm"
                      >
                        {postSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1" />Post</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Posts List */}
              {postsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-2 p-8 rounded-2xl border border-dashed border-border">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <p className="text-xs font-semibold text-muted-foreground">
                      {search ? "No posts match your search" : "No posts yet"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">Be the first to start a discussion!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(post.author_initials)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                              {post.author_initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-foreground">{post.author_name}</p>
                                {post.user_id !== currentUser?.id && (
                                  <button
                                    onClick={() => openChatWithPeer(post.user_id)}
                                    className="text-[10px] font-bold text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors"
                                  >
                                    <MessageCircle className="h-3 w-3" /> DM
                                  </button>
                                )}
                                {post.user_id === currentUser?.id && (
                                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">You</span>
                                )}
                              </div>
                              <p className="text-[9px] text-muted-foreground">{timeAgo(post.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-primary bg-primary/8 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Hash className="h-2.5 w-2.5" />general
                            </span>
                            {post.user_id === currentUser?.id && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                title="Delete post"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">{post.content}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <button
                            onClick={() => handleLike(post)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${post.likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                          >
                            <Heart className={`h-3.5 w-3.5 transition-all ${post.likedByMe ? "fill-red-500" : ""}`} />
                            {post.likes} {post.likes === 1 ? "Like" : "Likes"}
                          </button>

                          {post.user_id !== currentUser?.id && (
                            <button
                              onClick={() => openChatWithPeer(post.user_id)}
                              className="flex items-center gap-1 text-[10px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Direct Message
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div ref={feedEndRef} />
            </main>

            {/* Right Panel: Members / Groups toggle */}
            <aside className="w-64 border-l border-border bg-card flex flex-col gap-0 overflow-hidden shrink-0">
              <div className="grid grid-cols-2 border-b border-border">
                <button
                  onClick={() => setRightPanel("members")}
                  className={`text-[10px] font-bold py-2.5 flex items-center justify-center gap-1.5 transition-all border-b-2 ${rightPanel === "members" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <Users className="h-3 w-3" /> Classmates
                </button>
                <button
                  onClick={() => { setRightPanel("groups"); fetchGroups(); }}
                  className={`text-[10px] font-bold py-2.5 flex items-center justify-center gap-1.5 transition-all border-b-2 ${rightPanel === "groups" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <UsersRound className="h-3 w-3" /> Groups
                </button>
              </div>

              {/* Members panel */}
              {rightPanel === "members" && (
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                        Classmates Presence
                      </p>
                      <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                        <Circle className="h-1.5 w-1.5 fill-emerald-500 animate-pulse" /> Live
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-3 bg-muted/40 p-1 rounded-xl">
                      <button onClick={() => setMemberFilter("all")}
                        className={`text-[10px] font-bold py-1 rounded-lg transition-all ${memberFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}>
                        All ({membersWithPresence.length})
                      </button>
                      <button onClick={() => setMemberFilter("online")}
                        className={`text-[10px] font-bold py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${memberFilter === "online" ? "bg-card text-emerald-600 shadow-xs" : "text-muted-foreground"}`}>
                        <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
                        ({membersWithPresence.filter((m) => m.status === "online").length})
                      </button>
                      <button onClick={() => setMemberFilter("offline")}
                        className={`text-[10px] font-bold py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${memberFilter === "offline" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}>
                        <Circle className="h-1.5 w-1.5 fill-slate-400 text-slate-400" />
                        ({membersWithPresence.filter((m) => m.status === "offline").length})
                      </button>
                    </div>

                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input type="text" placeholder="Filter classmate..."
                        value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full h-7 pl-7 pr-2 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {membersLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-xl" />
                        ))}
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center p-4 rounded-xl border border-dashed border-border my-2">
                        <UserCheck className="h-6 w-6 mx-auto text-muted-foreground/40 mb-1" />
                        <p className="text-[10px] font-semibold text-muted-foreground">No classmates found</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredMembers.map((member) => {
                          const unread = recentDmMap[member.id]?.unreadCount || 0;
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                if (member.id !== currentUser?.id) {
                                  openChatWithPeer(member.id);
                                }
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group
                                ${member.id === currentUser?.id ? "opacity-60 cursor-default border-transparent" :
                                  activePeerId === member.id ? "border-primary bg-primary/5" :
                                  "border-transparent hover:border-border hover:bg-accent/50"}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative shrink-0">
                                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(member.initials)} flex items-center justify-center text-white text-[10px] font-bold shadow-xs`}>
                                    {member.initials}
                                  </div>
                                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${member.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                      {member.name}
                                      {member.id === currentUser?.id && <span className="ml-1 text-[8px] text-muted-foreground font-normal">(You)</span>}
                                    </p>
                                    {unread > 0 && (
                                      <span className="shrink-0 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white shadow-xs animate-pulse">
                                        {unread}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-muted-foreground truncate">
                                    <span className={`font-semibold ${member.status === "online" ? "text-emerald-500" : "text-slate-400"}`}>
                                      {member.status === "online" ? "● Online" : "○ Offline"}
                                    </span>
                                    {" · "}{member.department}
                                  </p>
                                </div>
                              </div>
                              {member.id !== currentUser?.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openChatWithPeer(member.id);
                                  }}
                                  className="shrink-0 h-7 w-7 p-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10"
                                  title={`Message ${member.name}`}
                                >
                                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Groups panel */}
              {rightPanel === "groups" && (
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Class Groups</p>
                    <Button size="sm" variant="outline" onClick={() => setShowCreateGroup(!showCreateGroup)} className="h-6 text-[10px] px-2 gap-1">
                      <Plus className="h-2.5 w-2.5" /> New Group
                    </Button>
                  </div>

                  {showCreateGroup && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-3">
                        <form onSubmit={handleCreateGroup} className="space-y-2">
                          <input type="text" placeholder="Group name (e.g. DBMS Study)" value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full h-7 px-2 text-[10px] bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                          <input type="text" placeholder="Description (optional)" value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            className="w-full h-7 px-2 text-[10px] bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                          <div className="flex gap-1">
                            <Button type="submit" size="sm" disabled={groupSubmitting || !newGroupName.trim()} className="flex-1 h-7 text-[10px] bg-primary text-white">
                              {groupSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setShowCreateGroup(false)} className="h-7 w-7 p-0">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {groupsLoading ? (
                    <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl" />)}</div>
                  ) : groups.length === 0 ? (
                    <div className="text-center p-6 rounded-xl border border-dashed border-border">
                      <UsersRound className="h-6 w-6 mx-auto text-muted-foreground/40 mb-1" />
                      <p className="text-[10px] font-semibold text-muted-foreground">No groups yet</p>
                      <p className="text-[9px] text-muted-foreground/60">Create the first study group!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {groups.map((group) => (
                        <div key={group.id} className="p-2.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                                  <UsersRound className="h-3 w-3 text-white" />
                                </div>
                                <p className="text-xs font-bold text-foreground truncate">{group.name}</p>
                              </div>
                              {group.description && (
                                <p className="text-[9px] text-muted-foreground mt-1 truncate">{group.description}</p>
                              )}
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => handleJoinGroup(group.id, group.isMember || false)}
                              className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-lg transition-all ${group.isMember ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                            >
                              {group.isMember ? "Leave" : <><UserPlus className="h-2.5 w-2.5 inline mr-0.5" />Join</>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ── MODE 2: DIRECT MESSAGES DUAL-PANE VIEW ── */}
        {mainTab === "dms" && (
          <div className="flex-1 flex overflow-hidden">

            {/* Left DM Sidebar: ONLY Active Conversation Peers + New Chat Action */}
            <aside className="w-72 md:w-80 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
              <div className="p-3 border-b border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-extrabold tracking-tight flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                      Direct Messages
                    </h2>
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {conversationMembers.length} active conversation{conversationMembers.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {/* + New Chat Button */}
                  <Button
                    size="sm"
                    onClick={() => setShowNewChatModal(true)}
                    className="h-7 text-[10px] font-bold gap-1 px-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl shadow-xs"
                  >
                    <Plus className="h-3 w-3" />
                    <span>New Chat</span>
                  </Button>
                </div>

                {/* Search in Conversations */}
                {conversationMembers.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <input type="text" placeholder="Search active chats..."
                      value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full h-7 pl-7 pr-2 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* DM Conversations List — ONLY active conversation peers! */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
                {membersLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : filteredConversationMembers.length === 0 ? (
                  <div className="text-center p-6 rounded-2xl border border-dashed border-border my-6 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <MessageSquarePlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">No active conversations</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Start a direct message with any classmate using the button below.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowNewChatModal(true)}
                      className="h-8 text-xs font-bold gap-1 px-4 bg-primary text-primary-foreground rounded-xl shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Start New Chat
                    </Button>
                  </div>
                ) : (
                  filteredConversationMembers.map((member) => {
                    const isActive = activePeerId === member.id;
                    const dmMeta = recentDmMap[member.id];
                    const unread = dmMeta?.unreadCount || 0;
                    const lastMsg = dmMeta?.lastMessage || "";
                    const timeStr = dmMeta?.lastMessageAt ? fmtTime(dmMeta.lastMessageAt) : "";

                    return (
                      <div
                        key={member.id}
                        onClick={() => openChatWithPeer(member.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group relative
                          ${isActive
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-transparent hover:border-border hover:bg-accent/40"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColor(member.initials)} flex items-center justify-center text-white text-xs font-bold shadow-xs`}>
                              {member.initials}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${member.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <p className={`text-xs font-bold truncate transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                                  {member.name}
                                </p>
                                {/* Prominent Green Unread Counter Badge Next To Classmate's Name */}
                                {unread > 0 && (
                                  <span className="shrink-0 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white shadow-xs animate-pulse">
                                    {unread}
                                  </span>
                                )}
                              </div>
                              {timeStr && (
                                <span className={`text-[8.5px] shrink-0 font-mono ${unread > 0 ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>
                                  {timeStr}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-1 mt-0.5">
                              <p className={`text-[10px] truncate max-w-[170px] ${unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                                {lastMsg || `${member.department}`}
                              </p>

                              {/* Additional Pill Badge if Unread */}
                              {unread > 0 && (
                                <span className="shrink-0 min-w-[20px] h-4 px-1 rounded-full text-[9.5px] font-extrabold bg-emerald-500 text-white flex items-center justify-center shadow-xs animate-pulse">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Right DM Chat Area */}
            <main className="flex-1 flex flex-col bg-muted/10 overflow-hidden">
              {activePeer ? (
                <>
                  {/* Chat Window Header */}
                  <div className="px-5 py-3.5 bg-card border-b border-border flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColor(activePeer.initials)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                          {activePeer.initials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${activePeer.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-foreground">{activePeer.name}</h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span>{activePeer.department}</span>
                          <span>·</span>
                          <Lock className="h-2.5 w-2.5 text-emerald-500" />
                          <span className="text-emerald-600 font-semibold">Real-time Direct Message</span>
                          <span>·</span>
                          <span className={`font-bold ${activePeer.status === "online" ? "text-emerald-500" : "text-slate-400"}`}>
                            {activePeer.status === "online" ? "🟢 Active Now" : "⚪ Offline"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message History Body */}
                  <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-3 bg-muted/20">
                    {dmLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : dmMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                          <MessageCircle className="h-7 w-7" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">Start a conversation with {activePeer.name}</h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Send a message to collaborate on coursework, discuss lab projects, or share study notes.
                        </p>
                      </div>
                    ) : (
                      dmMessages.map((msg) => {
                        const isMe = msg.sender_id === currentUser?.id;
                        return (
                          <div key={msg.id} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                              <div className={`max-w-[75%] md:max-w-[65%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs
                                ${isMe
                                  ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-br-xs font-medium"
                                  : "bg-card border border-border text-foreground rounded-bl-xs"}`}>
                                {msg.content}
                              </div>
                              {isMe && (
                                <button
                                  onClick={() => handleDeleteDM(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 mb-1"
                                  title="Delete message"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[8.5px] text-muted-foreground mt-1 px-1 flex items-center gap-1 font-mono">
                              {fmtTime(msg.created_at)}
                              {isMe && <CheckCheck className="h-3 w-3 text-blue-500 inline" />}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Footer */}
                  <form onSubmit={handleSendDM} className="p-3 bg-card border-t border-border flex items-center gap-2 shadow-md">
                    <input
                      type="text"
                      placeholder={`Message ${activePeer.name}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 h-10 px-4 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={!chatInput.trim() || dmSending}
                      className="h-10 px-5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5"
                    >
                      {dmSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" />Send</>}
                    </Button>
                  </form>
                </>
              ) : (
                /* No Classmate Selected State */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Your Direct Messages</h3>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    Select an active conversation on the left, or click "+ New Chat" to message any classmate.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowNewChatModal(true)}
                    className="h-9 text-xs font-bold gap-1.5 px-5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Start New Chat
                  </Button>
                </div>
              )}
            </main>

          </div>
        )}

        {/* ── MODAL: Start New Chat (Search All Registered Classmates) ── */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquarePlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">Start a New Chat</h3>
                    <p className="text-[10px] text-muted-foreground">Select a classmate from the directory</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-border bg-card">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search classmate by name or department..."
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>

              {/* Classmates Directory List */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
                {allClassmatesForNewChat.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground text-xs font-semibold">
                    No classmates match "{newChatSearch}"
                  </div>
                ) : (
                  allClassmatesForNewChat.map((classmate) => (
                    <div
                      key={classmate.id}
                      onClick={() => {
                        openChatWithPeer(classmate.id);
                        setShowNewChatModal(false);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-accent/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColor(classmate.initials)} flex items-center justify-center text-white text-xs font-bold shadow-xs`}>
                            {classmate.initials}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${classmate.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {classmate.name}
                          </p>
                          <p className="text-[9.5px] text-muted-foreground truncate">
                            <span className={`font-semibold ${classmate.status === "online" ? "text-emerald-500" : "text-slate-400"}`}>
                              {classmate.status === "online" ? "● Online" : "○ Offline"}
                            </span>
                            {" · "}{classmate.department}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold gap-1 text-primary group-hover:bg-primary/10">
                        <MessageCircle className="h-3 w-3" /> Chat
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </ChatLayout>
  );
}
