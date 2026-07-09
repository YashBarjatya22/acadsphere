import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, MessageSquare, Heart, Plus, Search, Hash, Circle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const STORAGE_KEY = "acadsphere_community_posts";

const INITIAL_POSTS: Post[] = [
  { id: "1", author: "Yash Barjatya", avatar: "YB", channel: "#placement-prep", content: "Just compiled a list of 50 core SQL JOIN questions commonly asked in product-based company interviews. Will share the notes link soon! Focus on INNER JOIN vs LEFT JOIN edge cases.", likes: 18, likedByMe: false, time: "2h ago", timestamp: Date.now() - 7200000 },
  { id: "2", author: "Rohan Patel", avatar: "RP", channel: "#dbms-lab", content: "Is anyone getting connection errors in DBMS Lab Exercise 4 on Port 1433? Would really appreciate it if someone can share their connection string configuration.", likes: 4, likedByMe: false, time: "5h ago", timestamp: Date.now() - 18000000 },
  { id: "3", author: "Sneha Kapoor", avatar: "SK", channel: "#viva-questions", content: "Pro tip: Examiners are heavily focusing on subnet masking calculations this semester. Practice prefix length conversions thoroughly — especially /26 and /28.", likes: 22, likedByMe: false, time: "1d ago", timestamp: Date.now() - 86400000 },
  { id: "4", author: "Neha Sharma", avatar: "NS", channel: "#general-chat", content: "Sharing the career roadmap I built using AcadSphere — it scheduled my revision sessions automatically based on my weakest topics. Highly recommend checking the Career Roadmap module!", likes: 31, likedByMe: false, time: "2d ago", timestamp: Date.now() - 172800000 },
];

const CHANNELS = [
  { name: "all", label: "All Topics", icon: Hash, count: 4 },
  { name: "#placement-prep", label: "placement-prep", icon: Hash, count: 1 },
  { name: "#dbms-lab", label: "dbms-lab", icon: Hash, count: 1 },
  { name: "#viva-questions", label: "viva-questions", icon: Hash, count: 1 },
  { name: "#general-chat", label: "general-chat", icon: Hash, count: 1 },
  { name: "#study-groups", label: "study-groups", icon: Hash, count: 0 },
];

const PEERS = [
  { name: "Yash Barjatya", status: "Practicing Networks Viva", active: true },
  { name: "Sneha Kapoor", status: "Updating Resume ATS", active: true },
  { name: "Neha Sharma", status: "Reviewing Career Roadmap", active: true },
  { name: "Rohan Patel", status: "Last active 20m ago", active: false },
  { name: "Arjun Singh", status: "Solving DSA problems", active: true },
];

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
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch { return INITIAL_POSTS; }
  });

  const [newPostText, setNewPostText] = useState("");
  const [newPostChannel, setNewPostChannel] = useState("#general-chat");
  const [activeChannel, setActiveChannel] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

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

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 py-4 border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-background to-rose-500/5 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">Community Forum</h1>
                <p className="text-[10px] text-muted-foreground">Connect, share notes, ask questions, and collaborate</p>
              </div>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold uppercase tracking-wider">
              Student Network
            </span>
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

          {/* Center: Feed */}
          <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Post composer */}
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <form onSubmit={handlePost} className="space-y-3">
                  <Textarea
                    placeholder="Share notes, ask a question, or post a placement tip..."
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

            {/* Posts */}
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
                            <p className="text-xs font-bold text-foreground">{post.author}</p>
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
                      <div className="flex items-center gap-4 pt-1 border-t border-border/40">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
                            post.likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 transition-all ${post.likedByMe ? "fill-red-500" : ""}`} />
                          {post.likes} {post.likes === 1 ? "Like" : "Likes"}
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" /> Reply
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Right: Online Peers */}
          <aside className="w-56 border-l border-border bg-card p-3 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2 flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                Online ({PEERS.filter((p) => p.active).length})
              </p>
              <div className="space-y-2">
                {PEERS.map((peer, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 px-2 py-1.5">
                    <div className="relative shrink-0">
                      <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarColor(peer.name.split(" ").map((n) => n[0]).join(""))} flex items-center justify-center text-white text-[9px] font-bold`}>
                        {peer.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${peer.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-foreground truncate">{peer.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{peer.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </ChatLayout>
  );
}
