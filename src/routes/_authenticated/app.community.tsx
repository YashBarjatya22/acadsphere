import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users, MessageSquare, Heart, Plus, Search, Hash, Circle, Send, X,
  CheckCheck, UserCheck, MessageCircle, Sparkles, Filter
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/community")({
  component: CommunityPage,
});

interface Post {
  id: string;
  author: string;
  avatar: string;
  channel: string;
  content: string;
  likes: number;
  likedByMe: boolean;
  time: string;
  timestamp: number;
}

interface PeerMember {
  id: string;
  name: string;
  avatar: string;
  department: string;
  semester: string;
  status: "online" | "offline";
  activity: string;
  lastSeen?: string;
}

interface DirectMessage {
  id: string;
  sender: "me" | "peer";
  text: string;
  timestamp: string;
}

const STORAGE_KEY_POSTS = "acadsphere_community_posts";
const STORAGE_KEY_CHATS = "acadsphere_community_chats_v2";

const INITIAL_POSTS: Post[] = [
  { id: "1", author: "Yash Barjatya", avatar: "YB", channel: "#placement-prep", content: "Just compiled a list of 50 core SQL JOIN questions commonly asked in product-based company interviews. Focus on INNER JOIN vs LEFT JOIN edge cases.", likes: 18, likedByMe: false, time: "2h ago", timestamp: Date.now() - 7200000 },
  { id: "2", author: "Rohan Patel", avatar: "RP", channel: "#dbms-lab", content: "Is anyone getting connection errors in DBMS Lab Exercise 4 on Port 1433? Sharing the working SQLite / MySQL connection string configuration here.", likes: 8, likedByMe: false, time: "5h ago", timestamp: Date.now() - 18000000 },
  { id: "3", author: "Sneha Kapoor", avatar: "SK", channel: "#viva-questions", content: "Pro tip for OS Lab: Examiners are heavily focusing on Semaphore vs Mutex differences and Producer-Consumer problem in C. Review the code templates on Lab Helper!", likes: 25, likedByMe: false, time: "1d ago", timestamp: Date.now() - 86400000 },
  { id: "4", author: "Neha Sharma", avatar: "NS", channel: "#general-chat", content: "Sharing the career roadmap I built using AcadSphere — it scheduled my revision sessions automatically based on my weakest topics.", likes: 31, likedByMe: false, time: "2d ago", timestamp: Date.now() - 172800000 },
  { id: "5", author: "Arjun Singh", avatar: "AS", channel: "#placement-prep", content: "Amazon SDE-1 campus placement drive schedule has been announced. Make sure your ATS Resume score is above 85% on Resume Builder before applying!", likes: 14, likedByMe: false, time: "3d ago", timestamp: Date.now() - 259200000 },
];

const CHANNELS = [
  { name: "all", label: "All Topics", icon: Hash, count: 5 },
  { name: "#placement-prep", label: "placement-prep", icon: Hash, count: 2 },
  { name: "#dbms-lab", label: "dbms-lab", icon: Hash, count: 1 },
  { name: "#viva-questions", label: "viva-questions", icon: Hash, count: 1 },
  { name: "#general-chat", label: "general-chat", icon: Hash, count: 1 },
  { name: "#study-groups", label: "study-groups", icon: Hash, count: 0 },
];

const MEMBERS: PeerMember[] = [
  { id: "p1", name: "Yash Barjatya", avatar: "YB", department: "CSE", semester: "Sem 6", status: "online", activity: "Practicing Networks Viva" },
  { id: "p2", name: "Sneha Kapoor", avatar: "SK", department: "CSE", semester: "Sem 6", status: "online", activity: "Updating Resume ATS Score" },
  { id: "p3", name: "Neha Sharma", avatar: "NS", department: "ISE", semester: "Sem 6", status: "online", activity: "Reviewing Career Roadmap" },
  { id: "p4", name: "Arjun Singh", avatar: "AS", department: "MCA", semester: "Sem 4", status: "online", activity: "Solving DSA Graph Problems" },
  { id: "p5", name: "Priya Nair", avatar: "PN", department: "CIVIL", semester: "Sem 2", status: "online", activity: "Reading Smart Notes" },
  { id: "p6", name: "Ananya Sharma", avatar: "AN", department: "ISE", semester: "Sem 6", status: "online", activity: "Lab Manual Completion Tracker" },
  { id: "p7", name: "Rohan Patel", avatar: "RP", department: "ECE", semester: "Sem 6", status: "offline", activity: "Last active 20m ago", lastSeen: "20 mins ago" },
  { id: "p8", name: "Vikramaditya Singh", avatar: "VS", department: "MCA", semester: "Sem 4", status: "offline", activity: "Last active 2h ago", lastSeen: "2 hours ago" },
  { id: "p9", name: "Karthik Raja", avatar: "KR", department: "MECH", semester: "Sem 4", status: "offline", activity: "Last active 1d ago", lastSeen: "1 day ago" },
];

const INITIAL_CHATS: Record<string, DirectMessage[]> = {
  p1: [
    { id: "m1", sender: "peer", text: "Hey! Let me know if you need the notes for Networks Socket Programming.", timestamp: "10:30 AM" },
    { id: "m2", sender: "me", text: "Thanks Yash! That would be really helpful for tomorrow's lab.", timestamp: "10:32 AM" },
  ],
  p2: [
    { id: "m3", sender: "peer", text: "Hi! Did you test your resume score on the Resume Builder?", timestamp: "Yesterday" },
  ],
};

const AUTOMATED_REPLIES: Record<string, string[]> = {
  p1: [
    "Hey! Got your message. Let's compare notes for tomorrow's lab session!",
    "Great point! I'm reviewing the TCP Socket code right now.",
    "Awesome, let me share my lab manual checklist with you."
  ],
  p2: [
    "Hi there! Just checked your text. Good luck with your preparation!",
    "Thanks for reaching out! Let's connect after the lecture."
  ],
  default: [
    "Hey! Thanks for texting. I'm currently working on my coursework and will get back to you shortly!",
    "Got your message! Let's catch up during the lab break.",
    "Hi! Thanks for reaching out via AcadSphere Community Chat."
  ]
};

function avatarColor(initials: string) {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-red-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
  ];
  const idx = initials.charCodeAt(0) % colors.length;
  return colors[idx];
}

function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch { return INITIAL_POSTS; }
  });

  const [chats, setChats] = useState<Record<string, DirectMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHATS);
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch { return INITIAL_CHATS; }
  });

  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "online" | "offline">("all");
  const [memberSearch, setMemberSearch] = useState("");

  const [newPostText, setNewPostText] = useState("");
  const [newPostChannel, setNewPostChannel] = useState("#general-chat");
  const [activeChannel, setActiveChannel] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }, [chats]);

  const filteredPosts = useMemo(() => {
    let list = activeChannel === "all" ? posts : posts.filter((p) => p.channel === activeChannel);
    if (search.trim()) {
      list = list.filter((p) =>
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase())
      );
    }
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [posts, activeChannel, search]);

  const filteredMembers = useMemo(() => {
    return MEMBERS.filter((m) => {
      if (memberFilter === "online" && m.status !== "online") return false;
      if (memberFilter === "offline" && m.status !== "offline") return false;
      if (memberSearch.trim()) {
        const query = memberSearch.toLowerCase();
        return m.name.toLowerCase().includes(query) || m.department.toLowerCase().includes(query);
      }
      return true;
    });
  }, [memberFilter, memberSearch]);

  const onlineMembersCount = MEMBERS.filter((m) => m.status === "online").length;
  const offlineMembersCount = MEMBERS.filter((m) => m.status === "offline").length;

  const activePeer = MEMBERS.find((m) => m.id === activePeerId);
  const currentPeerMessages = activePeerId ? chats[activePeerId] || [] : [];

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: "You",
      avatar: "YO",
      channel: newPostChannel,
      content: newPostText,
      likes: 0,
      likedByMe: false,
      time: "Just now",
      timestamp: Date.now(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostText("");
    toast.success("Post published to " + newPostChannel);
  };

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe }
          : p
      )
    );
  };

  const openDirectMessage = (peerId: string) => {
    setActivePeerId(peerId);
  };

  const openMessageByAuthorName = (authorName: string) => {
    const found = MEMBERS.find((m) => m.name.toLowerCase() === authorName.toLowerCase());
    if (found) {
      setActivePeerId(found.id);
    } else {
      // create temporary peer session
      const tempId = `temp_${Date.now()}`;
      const initials = authorName.split(" ").map((n) => n[0]).join("").toUpperCase();
      MEMBERS.push({
        id: tempId,
        name: authorName,
        avatar: initials,
        department: "CSE",
        semester: "Sem 6",
        status: "online",
        activity: "Active in Forum",
      });
      setActivePeerId(tempId);
    }
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activePeerId) return;

    const messageText = chatInputText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: DirectMessage = {
      id: Date.now().toString(),
      sender: "me",
      text: messageText,
      timestamp: timeStr,
    };

    setChats((prev) => ({
      ...prev,
      [activePeerId]: [...(prev[activePeerId] || []), newMsg],
    }));

    setChatInputText("");

    // Simulate automated peer response after 1.2s
    setTimeout(() => {
      const peerReplies = AUTOMATED_REPLIES[activePeerId] || AUTOMATED_REPLIES.default;
      const randomReply = peerReplies[Math.floor(Math.random() * peerReplies.length)];
      const replyMsg: DirectMessage = {
        id: (Date.now() + 1).toString(),
        sender: "peer",
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChats((prev) => ({
        ...prev,
        [activePeerId]: [...(prev[activePeerId] || []), replyMsg],
      }));
    }, 1200);
  };

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200 relative">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 py-4 border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-background to-rose-500/5 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">Community Forum & Peer Texting</h1>
                <p className="text-[10px] text-muted-foreground">Check online/offline status, text peers 1-on-1, and share study notes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                {onlineMembersCount} Online Now
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">

          {/* Left: Channels */}
          <aside className="w-56 border-r border-border bg-card p-3 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">Channels</p>
              <nav className="space-y-0.5">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.name}
                      onClick={() => setActiveChannel(ch.name)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeChannel === ch.name
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {ch.label}
                      </span>
                      {ch.count > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 rounded-full ${
                          activeChannel === ch.name ? "bg-white/20" : "bg-muted text-muted-foreground"
                        }`}>{ch.count}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Center: Community Feed */}
          <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10">

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search forum posts or authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Post Composer */}
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <form onSubmit={handlePost} className="space-y-3">
                  <Textarea
                    placeholder="Share notes, ask a question, or post a placement tip to the community..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="h-20 text-xs bg-muted/40 border-border resize-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={newPostChannel}
                      onChange={(e) => setNewPostChannel(e.target.value)}
                      className="h-8 text-xs bg-muted/40 border border-border rounded-lg px-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {CHANNELS.filter((c) => c.name !== "all").map((c) => (
                        <option key={c.name} value={c.name}>#{c.label}</option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs h-8 px-4 shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Post
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2 p-8 rounded-2xl border border-dashed border-border">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs font-semibold text-muted-foreground">No posts yet in this channel</p>
                  <p className="text-[10px] text-muted-foreground/70">Be the first to start a discussion!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(post.avatar)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                            {post.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-foreground">{post.author}</p>
                              {post.author !== "You" && (
                                <button
                                  onClick={() => openMessageByAuthorName(post.author)}
                                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                >
                                  <MessageCircle className="h-3 w-3" /> Text
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-muted-foreground">{post.time}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-primary bg-primary/8 border border-primary/20 px-2 py-0.5 rounded-full">
                          {post.channel}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-foreground/90 leading-relaxed">{post.content}</p>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
                            post.likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 transition-all ${post.likedByMe ? "fill-red-500" : ""}`} />
                          {post.likes} {post.likes === 1 ? "Like" : "Likes"}
                        </button>

                        {post.author !== "You" && (
                          <button
                            onClick={() => openMessageByAuthorName(post.author)}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Direct Text Message
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Right: Members & Online/Offline Status */}
          <aside className="w-64 border-l border-border bg-card p-3 flex flex-col gap-3 overflow-y-auto shrink-0 scrollbar-thin">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                  Classmates Presence
                </p>
              </div>

              {/* Online / Offline Filter Pills */}
              <div className="grid grid-cols-3 gap-1 mb-3 bg-muted/40 p-1 rounded-xl">
                <button
                  onClick={() => setMemberFilter("all")}
                  className={`text-[10px] font-bold py-1 rounded-lg transition-all ${
                    memberFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  All ({MEMBERS.length})
                </button>
                <button
                  onClick={() => setMemberFilter("online")}
                  className={`text-[10px] font-bold py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    memberFilter === "online" ? "bg-card text-emerald-600 shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
                  ({onlineMembersCount})
                </button>
                <button
                  onClick={() => setMemberFilter("offline")}
                  className={`text-[10px] font-bold py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    memberFilter === "offline" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  <Circle className="h-1.5 w-1.5 fill-slate-400 text-slate-400" />
                  ({offlineMembersCount})
                </button>
              </div>

              {/* Member Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter classmate..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full h-7 pl-7 pr-2 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Member List */}
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => openDirectMessage(member.id)}
                    className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(member.avatar)} flex items-center justify-center text-white text-[10px] font-bold shadow-xs`}>
                          {member.avatar}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                          member.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{member.name}</p>
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate">{member.activity}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>

        {/* 1-on-1 Direct Chat Window Drawer Modal */}
        {activePeer && (
          <div className="fixed bottom-4 right-6 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="p-3 bg-card border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarColor(activePeer.avatar)} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {activePeer.avatar}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                    activePeer.status === "online" ? "bg-emerald-500" : "bg-slate-400"
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{activePeer.name}</p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <span className={activePeer.status === "online" ? "text-emerald-500 font-bold" : "text-slate-400"}>
                      {activePeer.status === "online" ? "🟢 Online" : `⚪ Offline (${activePeer.lastSeen || 'Recently'})`}
                    </span>
                    · {activePeer.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePeerId(null)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-3 h-64 overflow-y-auto scrollbar-thin space-y-2.5 bg-muted/20 text-xs">
              {currentPeerMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-1">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                  <p className="text-xs font-bold text-foreground">Start 1-on-1 Direct Texting</p>
                  <p className="text-[10px] text-muted-foreground">Send a message to {activePeer.name} on AcadSphere Community Network.</p>
                </div>
              ) : (
                currentPeerMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground rounded-br-xs"
                          : "bg-card border border-border text-foreground rounded-bl-xs shadow-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-0.5 px-1 flex items-center gap-0.5">
                      {msg.timestamp}
                      {msg.sender === "me" && <CheckCheck className="h-2.5 w-2.5 text-blue-500 inline" />}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendDirectMessage} className="p-2 bg-card border-t border-border flex items-center gap-2">
              <input
                type="text"
                placeholder={`Text ${activePeer.name.split(" ")[0]}...`}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className="flex-1 h-8 px-3 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 w-8 p-0 bg-primary text-primary-foreground rounded-xl shrink-0"
                disabled={!chatInputText.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        )}

      </div>
    </ChatLayout>
  );
}
