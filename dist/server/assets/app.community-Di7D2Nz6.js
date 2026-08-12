import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, a as CardContent } from "./card-Cwsrt9M1.js";
import { T as Textarea } from "./textarea-bZdI8Am0.js";
import { toast } from "sonner";
import { supabase } from "./client-h4N4kZKq.js";
import { Users, Circle, RefreshCw, Search, Loader2, Send, MessageSquare, MessageCircle, Hash, Trash2, Heart, UsersRound, UserCheck, Plus, X, UserPlus, Lock, CheckCheck } from "lucide-react";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "./createSsrRpc-CzYOcfyh.js";
import "./server-CeiC96WD.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CZBfFAiY.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
function getInitials(name) {
  if (!name) return "ST";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
function avatarColor(initials) {
  const colors = ["from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-emerald-500 to-teal-600", "from-rose-500 to-red-600", "from-amber-500 to-orange-600", "from-cyan-500 to-blue-600", "from-fuchsia-500 to-pink-600", "from-lime-500 to-green-600"];
  const code = initials ? initials.charCodeAt(0) : 0;
  return colors[code % colors.length];
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function CommunityPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState(/* @__PURE__ */ new Set());
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberSearch, setMemberSearch] = useState("");
  const [rightPanel, setRightPanel] = useState("members");
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [activePeerId, setActivePeerId] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmLoading, setDmLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [dmSending, setDmSending] = useState(false);
  const chatEndRef = useRef(null);
  const feedEndRef = useRef(null);
  const activePeerIdRef = useRef(null);
  useEffect(() => {
    activePeerIdRef.current = activePeerId;
  }, [activePeerId]);
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      setCurrentUser(user);
    });
  }, []);
  const fetchProfiles = async () => {
    setMembersLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.rpc("get_all_students");
      if (error) {
        console.error("Error fetching students:", error);
        return;
      }
      if (data) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "Student",
          initials: getInitials(p.full_name || p.email?.split("@")[0] || "ST"),
          department: p.degree || "Computer Science",
          activity: p.target_role ? `Goal: ${p.target_role}` : "Active Student",
          status: "offline"
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setMembersLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser) fetchProfiles();
  }, [currentUser?.id]);
  useEffect(() => {
    if (!currentUser?.id) return;
    const room = supabase.channel("community-presence", {
      config: {
        presence: {
          key: currentUser.id
        }
      }
    });
    const syncPresence = () => {
      const state = room.presenceState();
      const onlineSet = /* @__PURE__ */ new Set();
      Object.keys(state).forEach((key) => {
        onlineSet.add(key);
        const presences = state[key];
        presences?.forEach((p) => {
          if (p.user_id) onlineSet.add(p.user_id);
        });
      });
      setOnlineUserIds(onlineSet);
    };
    room.on("presence", {
      event: "sync"
    }, syncPresence).on("presence", {
      event: "join"
    }, syncPresence).on("presence", {
      event: "leave"
    }, syncPresence).subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await room.track({
          user_id: currentUser.id,
          online_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    });
    return () => {
      supabase.removeChannel(room);
    };
  }, [currentUser?.id]);
  const fetchPosts = useCallback(async (uid) => {
    setPostsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("community_posts").select("*").order("created_at", {
        ascending: true
      });
      if (error) throw error;
      const userId = uid || currentUser?.id;
      let likedPostIds = /* @__PURE__ */ new Set();
      if (userId) {
        const {
          data: likeData
        } = await supabase.from("community_post_likes").select("post_id").eq("user_id", userId);
        if (likeData) likedPostIds = new Set(likeData.map((l) => l.post_id));
      }
      const mapped = (data || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        author_name: p.author_name || "",
        author_initials: p.author_initials || "",
        content: p.content,
        likes: p.likes || 0,
        created_at: p.created_at,
        likedByMe: likedPostIds.has(p.id)
      }));
      setPosts(mapped);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      toast.error("Could not refresh posts — showing cached feed");
    } finally {
      setPostsLoading(false);
    }
  }, [currentUser?.id]);
  useEffect(() => {
    if (currentUser?.id) fetchPosts(currentUser.id);
  }, [currentUser?.id]);
  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase.channel("community-posts-realtime-v2").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "community_posts"
    }, (payload) => {
      const p = payload.new;
      const newPost = {
        id: p.id,
        user_id: p.user_id,
        author_name: p.author_name || "",
        author_initials: p.author_initials || "",
        content: p.content,
        likes: p.likes || 0,
        created_at: p.created_at,
        likedByMe: false
      };
      setPosts((prev) => {
        if (prev.some((x) => x.id === newPost.id)) return prev;
        return [...prev, newPost];
      });
    }).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "community_posts"
    }, (payload) => {
      const p = payload.new;
      setPosts((prev) => prev.map((post) => post.id === p.id ? {
        ...post,
        likes: p.likes ?? post.likes,
        content: p.content ?? post.content
      } : post));
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "community_posts"
    }, (payload) => {
      const p = payload.old;
      setPosts((prev) => prev.filter((post) => post.id !== p.id));
    }).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "community_post_likes"
    }, (payload) => {
      const p = payload.new;
      setPosts((prev) => prev.map((post) => post.id === p.post_id ? {
        ...post,
        likes: post.likes + 1,
        likedByMe: p.user_id === currentUser.id ? true : post.likedByMe
      } : post));
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "community_post_likes"
    }, (payload) => {
      const p = payload.old;
      setPosts((prev) => prev.map((post) => post.id === p.post_id ? {
        ...post,
        likes: Math.max(0, post.likes - 1),
        likedByMe: p.user_id === currentUser.id ? false : post.likedByMe
      } : post));
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") console.log("[Community] Posts channel subscribed ✓");
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);
  const fetchDMs = useCallback(async (peerId) => {
    if (!currentUser?.id) return;
    setDmLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("private_messages").select("*").or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${currentUser.id})`).order("created_at", {
        ascending: true
      });
      if (error) throw error;
      setDmMessages(data || []);
    } catch (err) {
      console.error("Failed to load DMs:", err);
      toast.error("Could not load messages");
    } finally {
      setDmLoading(false);
    }
  }, [currentUser?.id]);
  useEffect(() => {
    if (activePeerId && currentUser?.id) {
      fetchDMs(activePeerId);
    } else {
      setDmMessages([]);
    }
  }, [activePeerId, currentUser?.id]);
  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase.channel(`private-messages-${currentUser.id}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "private_messages",
      filter: `receiver_id=eq.${currentUser.id}`
    }, (payload) => {
      const msg = payload.new;
      if (msg.sender_id === activePeerIdRef.current) {
        setDmMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "private_messages"
    }, (payload) => {
      const p = payload.old;
      setDmMessages((prev) => prev.filter((m) => m.id !== p.id));
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") console.log("[Community] DM channel subscribed ✓");
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);
  const fetchGroups = async () => {
    if (!currentUser?.id) return;
    setGroupsLoading(true);
    try {
      const {
        data: groupData,
        error
      } = await supabase.from("community_groups").select("*, community_group_members(user_id)").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      const mapped = (groupData || []).map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description || "",
        created_by: g.created_by,
        memberCount: g.community_group_members?.length || 0,
        isMember: g.community_group_members?.some((m) => m.user_id === currentUser?.id)
      }));
      setGroups(mapped);
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setGroupsLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser?.id && rightPanel === "groups") fetchGroups();
  }, [currentUser?.id, rightPanel]);
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [posts.length]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [dmMessages.length, activePeerId]);
  const membersWithPresence = useMemo(() => members.map((m) => ({
    ...m,
    status: onlineUserIds.has(m.id) ? "online" : "offline"
  })), [members, onlineUserIds]);
  const onlineMembersCount = useMemo(() => {
    const classOnline = membersWithPresence.filter((m) => m.status === "online").length;
    return Math.max(onlineUserIds.size, classOnline + (currentUser ? 1 : 0));
  }, [membersWithPresence, onlineUserIds, currentUser]);
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
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((p) => p.content.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q));
  }, [posts, search]);
  const activePeer = useMemo(() => activePeerId ? membersWithPresence.find((m) => m.id === activePeerId) || null : null, [membersWithPresence, activePeerId]);
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() || !currentUser) return;
    setPostSubmitting(true);
    const authorName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Student";
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticPost = {
      id: optimisticId,
      user_id: currentUser.id,
      author_name: authorName,
      author_initials: getInitials(authorName),
      content: newPostText.trim(),
      likes: 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      likedByMe: false
    };
    setPosts((prev) => [...prev, optimisticPost]);
    setNewPostText("");
    try {
      const {
        data,
        error
      } = await supabase.from("community_posts").insert({
        user_id: currentUser.id,
        author_name: authorName,
        author_initials: getInitials(authorName),
        content: optimisticPost.content,
        likes: 0
      }).select().single();
      if (error) throw error;
      setPosts((prev) => prev.map((p) => p.id === optimisticId ? {
        ...optimisticPost,
        id: data.id,
        created_at: data.created_at
      } : p));
      toast.success("Post published!");
    } catch (err) {
      setPosts((prev) => prev.filter((p) => p.id !== optimisticId));
      toast.error("Failed to post: " + (err.message || "Unknown error"));
    } finally {
      setPostSubmitting(false);
    }
  };
  const handleDeletePost = async (postId) => {
    if (!currentUser) return;
    try {
      const {
        error
      } = await supabase.from("community_posts").delete().eq("id", postId).eq("user_id", currentUser.id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Could not delete post: " + (err.message || ""));
    }
  };
  const handleLike = async (post) => {
    if (!currentUser) return;
    try {
      if (post.likedByMe) {
        await supabase.from("community_post_likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id);
        await supabase.from("community_posts").update({
          likes: Math.max(0, post.likes - 1)
        }).eq("id", post.id);
      } else {
        await supabase.from("community_post_likes").insert({
          post_id: post.id,
          user_id: currentUser.id
        });
        await supabase.from("community_posts").update({
          likes: post.likes + 1
        }).eq("id", post.id);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };
  const handleSendDM = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activePeerId || !currentUser) return;
    setDmSending(true);
    const content = chatInput.trim();
    setChatInput("");
    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: activePeerId,
      content,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    setDmMessages((prev) => [...prev, optimisticMsg]);
    try {
      const {
        data,
        error
      } = await supabase.from("private_messages").insert({
        sender_id: currentUser.id,
        receiver_id: activePeerId,
        content
      }).select().single();
      if (error) throw error;
      setDmMessages((prev) => prev.map((m) => m.id === optimisticMsg.id ? data : m));
    } catch (err) {
      setDmMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setChatInput(content);
      toast.error("Failed to send: " + (err.message || ""));
    } finally {
      setDmSending(false);
    }
  };
  const handleDeleteDM = async (msgId) => {
    try {
      const {
        error
      } = await supabase.from("private_messages").delete().eq("id", msgId).eq("sender_id", currentUser.id);
      if (error) throw error;
      setDmMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      toast.error("Could not delete message");
    }
  };
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;
    setGroupSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.from("community_groups").insert({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        created_by: currentUser.id
      }).select().single();
      if (error) throw error;
      await supabase.from("community_group_members").insert({
        group_id: data.id,
        user_id: currentUser.id
      });
      toast.success(`Group "${newGroupName}" created!`);
      setNewGroupName("");
      setNewGroupDesc("");
      setShowCreateGroup(false);
      fetchGroups();
    } catch (err) {
      toast.error("Failed to create group: " + (err.message || ""));
    } finally {
      setGroupSubmitting(false);
    }
  };
  const handleJoinGroup = async (groupId, isMember) => {
    if (!currentUser) return;
    try {
      if (isMember) {
        await supabase.from("community_group_members").delete().eq("group_id", groupId).eq("user_id", currentUser.id);
        toast.success("Left group");
      } else {
        await supabase.from("community_group_members").insert({
          group_id: groupId,
          user_id: currentUser.id
        });
        toast.success("Joined group!");
      }
      fetchGroups();
    } catch (err) {
      toast.error(err.message || "Error updating group membership");
    }
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background text-foreground flex flex-col transition-colors duration-200 relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden px-6 py-4 border-b border-border shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-pink-500/10 via-background to-rose-500/5 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-sm font-extrabold tracking-tight", children: "Community Forum" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Shared class feed · Real-time presence · Private messaging" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" }),
            onlineMembersCount,
            " Online"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
            fetchProfiles();
            fetchPosts(currentUser?.id);
          }, className: "h-7 text-[10px] gap-1 px-2.5", title: "Refresh", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `h-3 w-3 ${membersLoading ? "animate-spin" : ""}` }),
            "Sync"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden", children: [
      /* @__PURE__ */ jsxs("main", { className: "flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search posts or authors...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full h-9 pl-9 pr-4 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "border-border bg-card shadow-sm", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handlePost, className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(getInitials(currentUser?.user_metadata?.full_name || "You"))} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1`, children: getInitials(currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "You") }),
            /* @__PURE__ */ jsx(Textarea, { placeholder: "Share notes, ask a question, or post a tip to your class...", value: newPostText, onChange: (e) => setNewPostText(e.target.value), className: "flex-1 h-20 text-xs bg-muted/40 border-border resize-none focus:ring-1 focus:ring-primary", required: true })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", disabled: postSubmitting || !newPostText.trim(), className: "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs h-8 px-5 shadow-sm", children: postSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 mr-1" }),
            "Post"
          ] }) }) })
        ] }) }) }),
        postsLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-28 bg-card border border-border rounded-xl animate-pulse" }, i)) }) : filteredPosts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2 p-8 rounded-2xl border border-dashed border-border", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 mx-auto text-muted-foreground/40" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: search ? "No posts match your search" : "No posts yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/70", children: "Be the first to start a discussion!" })
        ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredPosts.map((post) => /* @__PURE__ */ jsx(Card, { className: "border-border bg-card shadow-sm hover:shadow-md transition-shadow group", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(post.author_initials)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`, children: post.author_initials }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: post.author_name }),
                  post.user_id !== currentUser?.id && /* @__PURE__ */ jsxs("button", { onClick: () => {
                    const found = membersWithPresence.find((m) => m.id === post.user_id);
                    if (found) setActivePeerId(found.id);
                    else {
                      setActivePeerId(post.user_id);
                    }
                  }, className: "text-[10px] font-bold text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors", children: [
                    /* @__PURE__ */ jsx(MessageCircle, { className: "h-3 w-3" }),
                    " DM"
                  ] }),
                  post.user_id === currentUser?.id && /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold", children: "You" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground", children: timeAgo(post.created_at) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-bold text-primary bg-primary/8 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Hash, { className: "h-2.5 w-2.5" }),
                "general"
              ] }),
              post.user_id === currentUser?.id && /* @__PURE__ */ jsx("button", { onClick: () => handleDeletePost(post.id), className: "opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10", title: "Delete post", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/90 leading-relaxed", children: post.content }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1 border-t border-border/40", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => handleLike(post), className: `flex items-center gap-1.5 text-[10px] font-bold transition-colors ${post.likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`, children: [
              /* @__PURE__ */ jsx(Heart, { className: `h-3.5 w-3.5 transition-all ${post.likedByMe ? "fill-red-500" : ""}` }),
              post.likes,
              " ",
              post.likes === 1 ? "Like" : "Likes"
            ] }),
            post.user_id !== currentUser?.id && /* @__PURE__ */ jsxs("button", { onClick: () => {
              const found = membersWithPresence.find((m) => m.id === post.user_id);
              if (found) setActivePeerId(found.id);
              else setActivePeerId(post.user_id);
            }, className: "flex items-center gap-1 text-[10px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
              " Direct Message"
            ] })
          ] })
        ] }) }, post.id)) }),
        /* @__PURE__ */ jsx("div", { ref: feedEndRef })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "w-64 border-l border-border bg-card flex flex-col gap-0 overflow-hidden shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 border-b border-border", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setRightPanel("members"), className: `text-[10px] font-bold py-2.5 flex items-center justify-center gap-1.5 transition-all border-b-2 ${rightPanel === "members" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
            " Classmates"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            setRightPanel("groups");
            fetchGroups();
          }, className: `text-[10px] font-bold py-2.5 flex items-center justify-center gap-1.5 transition-all border-b-2 ${rightPanel === "groups" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx(UsersRound, { className: "h-3 w-3" }),
            " Groups"
          ] })
        ] }),
        rightPanel === "members" && /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1", children: "Classmates Presence" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-emerald-500 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Circle, { className: "h-1.5 w-1.5 fill-emerald-500 animate-pulse" }),
              " Live"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-1 mb-3 bg-muted/40 p-1 rounded-xl", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setMemberFilter("all"), className: `text-[10px] font-bold py-1 rounded-lg transition-all ${memberFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`, children: [
              "All (",
              membersWithPresence.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setMemberFilter("online"), className: `text-[10px] font-bold py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${memberFilter === "online" ? "bg-card text-emerald-600 shadow-xs" : "text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsx(Circle, { className: "h-1.5 w-1.5 fill-emerald-500 text-emerald-500" }),
              "(",
              membersWithPresence.filter((m) => m.status === "online").length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setMemberFilter("offline"), className: `text-[10px] font-bold py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${memberFilter === "offline" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsx(Circle, { className: "h-1.5 w-1.5 fill-slate-400 text-slate-400" }),
              "(",
              membersWithPresence.filter((m) => m.status === "offline").length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative mb-3", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Filter classmate...", value: memberSearch, onChange: (e) => setMemberSearch(e.target.value), className: "w-full h-7 pl-7 pr-2 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" })
          ] }),
          membersLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx("div", { className: "h-10 bg-muted/40 animate-pulse rounded-xl" }, i)) }) : filteredMembers.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center p-4 rounded-xl border border-dashed border-border my-2", children: [
            /* @__PURE__ */ jsx(UserCheck, { className: "h-6 w-6 mx-auto text-muted-foreground/40 mb-1" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground", children: "No classmates found" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: filteredMembers.map((member) => /* @__PURE__ */ jsxs("div", { onClick: () => setActivePeerId(member.id === currentUser?.id ? null : member.id), className: `flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group
                            ${member.id === currentUser?.id ? "opacity-60 cursor-default border-transparent" : activePeerId === member.id ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-accent/50"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
                /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(member.initials)} flex items-center justify-center text-white text-[10px] font-bold shadow-xs`, children: member.initials }),
                /* @__PURE__ */ jsx("span", { className: `absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${member.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}` })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors", children: [
                  member.name,
                  member.id === currentUser?.id && /* @__PURE__ */ jsx("span", { className: "ml-1 text-[8px] text-muted-foreground font-normal", children: "(You)" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-muted-foreground truncate", children: [
                  /* @__PURE__ */ jsx("span", { className: `font-semibold ${member.status === "online" ? "text-emerald-500" : "text-slate-400"}`, children: member.status === "online" ? "● Online" : "○ Offline" }),
                  " · ",
                  member.department
                ] })
              ] })
            ] }),
            member.id !== currentUser?.id && /* @__PURE__ */ jsx("button", { onClick: (e) => {
              e.stopPropagation();
              setActivePeerId(member.id);
            }, className: "shrink-0 h-7 w-7 p-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10", title: `Message ${member.name}`, children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 text-primary" }) })
          ] }, member.id)) })
        ] }) }),
        rightPanel === "groups" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-widest", children: "Class Groups" }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowCreateGroup(!showCreateGroup), className: "h-6 text-[10px] px-2 gap-1", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-2.5 w-2.5" }),
              " New Group"
            ] })
          ] }),
          showCreateGroup && /* @__PURE__ */ jsx(Card, { className: "border-primary/30 bg-primary/5", children: /* @__PURE__ */ jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateGroup, className: "space-y-2", children: [
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Group name (e.g. DBMS Study)", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value), className: "w-full h-7 px-2 text-[10px] bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary", required: true }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Description (optional)", value: newGroupDesc, onChange: (e) => setNewGroupDesc(e.target.value), className: "w-full h-7 px-2 text-[10px] bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", disabled: groupSubmitting || !newGroupName.trim(), className: "flex-1 h-7 text-[10px] bg-primary text-white", children: groupSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : "Create" }),
              /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => setShowCreateGroup(false), className: "h-7 w-7 p-0", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
            ] })
          ] }) }) }),
          groupsLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [1, 2].map((i) => /* @__PURE__ */ jsx("div", { className: "h-16 bg-muted/40 animate-pulse rounded-xl" }, i)) }) : groups.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-xl border border-dashed border-border", children: [
            /* @__PURE__ */ jsx(UsersRound, { className: "h-6 w-6 mx-auto text-muted-foreground/40 mb-1" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground", children: "No groups yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground/60", children: "Create the first study group!" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: groups.map((group) => /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(UsersRound, { className: "h-3 w-3 text-white" }) }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground truncate", children: group.name })
              ] }),
              group.description && /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-1 truncate", children: group.description }),
              /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-muted-foreground mt-0.5", children: [
                group.memberCount,
                " member",
                group.memberCount !== 1 ? "s" : ""
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleJoinGroup(group.id, group.isMember || false), className: `shrink-0 text-[9px] font-bold px-2 py-1 rounded-lg transition-all ${group.isMember ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`, children: group.isMember ? "Leave" : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "h-2.5 w-2.5 inline mr-0.5" }),
              "Join"
            ] }) })
          ] }) }, group.id)) })
        ] })
      ] })
    ] }),
    activePeer && /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 right-6 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden", style: {
      animation: "slideUpFade 0.2s ease-out"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gradient-to-r from-primary/10 via-card to-card border-b border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(activePeer.initials)} flex items-center justify-center text-white text-[10px] font-bold`, children: activePeer.initials }),
            /* @__PURE__ */ jsx("span", { className: `absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${activePeer.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}` })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activePeer.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-muted-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Lock, { className: "h-2.5 w-2.5" }),
              /* @__PURE__ */ jsx("span", { className: "text-[8px]", children: "Private · End-to-end" }),
              /* @__PURE__ */ jsxs("span", { className: `font-bold ${activePeer.status === "online" ? "text-emerald-500" : "text-slate-400"}`, children: [
                "· ",
                activePeer.status === "online" ? "🟢 Online" : "⚪ Offline"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setActivePeerId(null), className: "h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3 h-72 overflow-y-auto scrollbar-thin space-y-2.5 bg-muted/20", children: [
        dmLoading ? /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }) : dmMessages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center p-4 space-y-1", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-6 w-6 text-muted-foreground/40" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: "Start a private conversation" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            "Your messages with ",
            activePeer.name,
            " are private"
          ] })
        ] }) : dmMessages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return /* @__PURE__ */ jsxs("div", { className: `flex flex-col group ${isMe ? "items-end" : "items-start"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: `flex items-end gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`, children: [
              /* @__PURE__ */ jsx("div", { className: `max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                          ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm shadow-xs"}`, children: msg.content }),
              isMe && /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteDM(msg.id), className: "opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 mb-1", title: "Delete message", children: /* @__PURE__ */ jsx(Trash2, { className: "h-2.5 w-2.5" }) })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-muted-foreground mt-0.5 px-1 flex items-center gap-0.5", children: [
              fmtTime(msg.created_at),
              isMe && /* @__PURE__ */ jsx(CheckCheck, { className: "h-2.5 w-2.5 text-blue-500 inline" })
            ] })
          ] }, msg.id);
        }),
        /* @__PURE__ */ jsx("div", { ref: chatEndRef })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSendDM, className: "p-2 bg-card border-t border-border flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: `Message ${activePeer.name.split(" ")[0]}...`, value: chatInput, onChange: (e) => setChatInput(e.target.value), className: "flex-1 h-8 px-3 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary", autoFocus: true }),
        /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", className: "h-8 w-8 p-0 bg-primary text-primary-foreground rounded-xl shrink-0", disabled: !chatInput.trim() || dmSending, children: dmSending ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        ` })
  ] }) });
}
export {
  CommunityPage as component
};
