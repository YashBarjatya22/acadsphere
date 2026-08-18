import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CQTokSDO.js";
import { C as ChatLayout, l as listThreads, g as getThreadMessages, c as createThread, s as saveMessage, d as deleteThread, r as renameThread } from "./ChatLayout-HmtBFy90.js";
import { a as generateAcademicResponse } from "./router-DbkkPA-j.js";
import { toast } from "sonner";
import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Search, MessageSquare, MoreHorizontal, PencilLine, Trash2, Sparkles, Loader2, BookOpen, Brain, HelpCircle, Zap, Bot, X, Send, User } from "lucide-react";
import "@tanstack/react-router";
import "./server-DkTRikc9.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-C_UiqRP9.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./client-h4N4kZKq.js";
import "./button-CUmEMVhO.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./studentos-logo-CCLo3MN1.js";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "ai";
import "./ai-gateway.server-DLub9oIv.js";
import "@ai-sdk/openai-compatible";
const TEMPLATES = [{
  icon: BookOpen,
  label: "Summarize Topic",
  color: "text-blue-500",
  bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  prompt: "Summarize the core concepts of Database Normalization (1NF, 2NF, 3NF, BCNF) into clear bullet points with examples."
}, {
  icon: Brain,
  label: "Explain Concept",
  color: "text-purple-500",
  bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
  prompt: "Explain the Banker's Algorithm for deadlock avoidance with a real-life analogy so a first-year student can understand it."
}, {
  icon: HelpCircle,
  label: "Generate Quiz",
  color: "text-amber-500",
  bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
  prompt: "Generate 5 challenging multiple-choice questions on Computer Networks (TCP/UDP, OSI Model, IP Subnetting) with answers and explanations."
}, {
  icon: Zap,
  label: "Make Flashcards",
  color: "text-pink-500",
  bg: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20",
  prompt: "Create 6 active-recall flashcards for Operating System Semaphores and Mutexes. Format each as Front (Question) and Back (Answer)."
}];
function groupThreadsByDate(threads) {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 864e5);
  const last7 = new Date(today.getTime() - 7 * 864e5);
  const last30 = new Date(today.getTime() - 30 * 864e5);
  const groups = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    "Last 30 Days": [],
    Older: []
  };
  for (const t of threads) {
    const d = new Date(t.updated_at);
    if (d >= today) groups.Today.push(t);
    else if (d >= yesterday) groups.Yesterday.push(t);
    else if (d >= last7) groups["Last 7 Days"].push(t);
    else if (d >= last30) groups["Last 30 Days"].push(t);
    else groups.Older.push(t);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0).map(([label, items]) => ({
    label,
    items
  }));
}
function AIAssistantPage() {
  const qc = useQueryClient();
  const createFn = useServerFn(createThread);
  const listFn = useServerFn(listThreads);
  const deleteFn = useServerFn(deleteThread);
  const renameFn = useServerFn(renameThread);
  const saveMsgFn = useServerFn(saveMessage);
  const getMsgsFn = useServerFn(getThreadMessages);
  const {
    data: threads = [],
    isLoading: threadsLoading
  } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn(),
    refetchInterval: 3e4
  });
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingId, setStreamingId] = useState(null);
  const streamBufferRef = useRef("");
  const rafRef = useRef(null);
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, streamingContent, isStreaming]);
  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    getMsgsFn({
      data: {
        threadId: activeThreadId
      }
    }).then((res) => {
      if (res && res.messages) {
        const loaded = res.messages.map((m) => {
          let content = "";
          try {
            const parts = typeof m.parts === "string" ? JSON.parse(m.parts) : m.parts;
            if (Array.isArray(parts)) content = parts.map((p) => p.text ?? p.content ?? "").join("");
            else content = String(parts ?? "");
          } catch {
            content = typeof m.parts === "string" ? m.parts : "";
          }
          return {
            id: m.id,
            role: m.role,
            content
          };
        });
        setMessages(loaded);
      }
    }).catch((e) => {
      console.warn("Failed to load thread messages", e);
    }).finally(() => {
      setMessagesLoading(false);
    });
  }, [activeThreadId, getMsgsFn]);
  const ensureThread = useCallback(async (firstMessage) => {
    if (activeThreadId) return activeThreadId;
    const title = firstMessage.length > 60 ? firstMessage.slice(0, 57) + "..." : firstMessage;
    try {
      const thread = await createFn({
        data: {
          title,
          module: "ai-assistant"
        }
      });
      if (thread && thread.id) {
        setActiveThreadId(thread.id);
        qc.invalidateQueries({
          queryKey: ["threads"]
        });
        return thread.id;
      }
    } catch (e) {
      console.warn("Failed creating thread via server function:", e);
    }
    const fallbackId = "thread-" + crypto.randomUUID();
    setActiveThreadId(fallbackId);
    return fallbackId;
  }, [activeThreadId, createFn, qc]);
  const handleSend = useCallback(async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "48px";
    }
    const userMsgId = crypto.randomUUID();
    const userMsg = {
      id: userMsgId,
      role: "user",
      content: trimmed
    };
    setMessages((prev) => [...prev, userMsg]);
    const assistantMsgId = crypto.randomUUID();
    streamBufferRef.current = "";
    setStreamingId(assistantMsgId);
    setStreamingContent("");
    setIsStreaming(true);
    abortRef.current = new AbortController();
    const scheduleFlush = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setStreamingContent(streamBufferRef.current);
      });
    };
    try {
      const threadId = await ensureThread(trimmed);
      saveMsgFn({
        data: {
          id: userMsgId,
          threadId,
          role: "user",
          parts: [{
            type: "text",
            text: trimmed
          }]
        }
      }).catch((e) => console.warn("Failed saving user msg", e));
      const apiMessages = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{
          type: "text",
          text: m.content
        }]
      }));
      const demoToken = localStorage.getItem("demo_session_token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...demoToken ? {
            Authorization: `Bearer ${demoToken}`
          } : {}
        },
        body: JSON.stringify({
          messages: apiMessages,
          threadId
        }),
        signal: abortRef.current.signal
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const {
            done,
            value
          } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, {
            stream: true
          });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = (parsed.type === "text-delta" ? parsed.delta ?? parsed.textDelta : null) ?? parsed.textDelta ?? parsed.text ?? null;
              if (delta) {
                streamBufferRef.current += delta;
                scheduleFlush();
              }
            } catch {
              if (dataStr && !dataStr.startsWith("{") && dataStr !== "[DONE]") {
                streamBufferRef.current += dataStr;
                scheduleFlush();
              }
            }
          }
        }
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      let replyContent = streamBufferRef.current;
      if (!replyContent.trim()) {
        replyContent = `I've received your query: **"${trimmed}"**

Let me break this down for you with key concepts, examples, and study tips.`;
      }
      setMessages((prev) => [...prev, {
        id: assistantMsgId,
        role: "assistant",
        content: replyContent
      }]);
      setStreamingContent("");
      setStreamingId(null);
      saveMsgFn({
        data: {
          id: assistantMsgId,
          threadId,
          role: "assistant",
          parts: [{
            type: "text",
            text: replyContent
          }]
        }
      }).catch((e) => console.warn("Failed saving assistant msg", e));
      qc.invalidateQueries({
        queryKey: ["threads"]
      });
    } catch (err) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (err?.name === "AbortError") {
        const partial = streamBufferRef.current;
        if (partial.trim()) {
          setMessages((prev) => [...prev, {
            id: assistantMsgId,
            role: "assistant",
            content: partial
          }]);
        }
        setStreamingContent("");
        setStreamingId(null);
        return;
      }
      console.warn("AI chat error:", err);
      const fallback = generateAcademicResponse(trimmed);
      setMessages((prev) => [...prev, {
        id: assistantMsgId,
        role: "assistant",
        content: fallback
      }]);
      setStreamingContent("");
      setStreamingId(null);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      streamBufferRef.current = "";
      inputRef.current?.focus();
    }
  }, [input, isStreaming, messages, ensureThread, saveMsgFn, qc]);
  const handleNewChat = () => {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    setActiveThreadId(null);
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };
  const handleSelectThread = (threadId) => {
    if (threadId === activeThreadId) return;
    if (isStreaming) abortRef.current?.abort();
    setActiveThreadId(threadId);
    setMenuOpenId(null);
  };
  const deleteThreadMutation = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({
        queryKey: ["threads"]
      });
      if (id === activeThreadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
      toast.success("Chat deleted");
    },
    onError: () => toast.error("Failed to delete chat")
  });
  const handleRenameSubmit = async (id) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await renameFn({
        data: {
          id,
          title: renameValue.trim()
        }
      });
      qc.invalidateQueries({
        queryKey: ["threads"]
      });
      toast.success("Renamed");
    } catch {
      toast.error("Failed to rename");
    }
    setRenamingId(null);
  };
  const filteredThreads = search.trim() ? threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())) : threads;
  const grouped = groupThreadsByDate(filteredThreads);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId, children: /* @__PURE__ */ jsxs("div", { className: "flex h-full overflow-hidden", children: [
    /* @__PURE__ */ jsxs("aside", { className: "w-64 shrink-0 flex flex-col border-r border-border bg-sidebar overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-border shrink-0", children: /* @__PURE__ */ jsxs("button", { onClick: handleNewChat, className: "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-[.98] transition-all duration-150 shadow-sm", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
        "New Chat"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "px-3 py-2 border-b border-border shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" }),
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search chats...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg border border-border bg-muted/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto py-2 scrollbar-thin", children: threadsLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-1.5 px-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: "h-8 rounded-lg bg-muted/40 animate-pulse" }, i)) }) : grouped.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 text-center", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: search ? "No chats found" : "No chats yet. Start one!" })
      ] }) : grouped.map(({
        label,
        items
      }) => /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("p", { className: "px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60", children: label }),
        items.map((thread) => /* @__PURE__ */ jsxs("div", { className: `group relative mx-2 flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-100 ${thread.id === activeThreadId ? "bg-foreground text-background" : "hover:bg-accent text-foreground"}`, onClick: () => handleSelectThread(thread.id), children: [
          renamingId === thread.id ? /* @__PURE__ */ jsx("input", { autoFocus: true, value: renameValue, onChange: (e) => setRenameValue(e.target.value), onBlur: () => handleRenameSubmit(thread.id), onKeyDown: (e) => {
            if (e.key === "Enter") handleRenameSubmit(thread.id);
            if (e.key === "Escape") setRenamingId(null);
            e.stopPropagation();
          }, onClick: (e) => e.stopPropagation(), className: "flex-1 min-w-0 bg-transparent text-[11px] font-medium outline-none border-b border-primary" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: `h-3 w-3 shrink-0 ${thread.id === activeThreadId ? "text-background/70" : "text-muted-foreground"}` }),
            /* @__PURE__ */ jsx("span", { className: `flex-1 min-w-0 truncate text-[11px] font-medium leading-tight`, children: thread.title })
          ] }),
          renamingId !== thread.id && /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.stopPropagation();
            setMenuOpenId(menuOpenId === thread.id ? null : thread.id);
          }, className: `shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${thread.id === activeThreadId ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground"}`, children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-3 w-3" }) }),
          menuOpenId === thread.id && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setMenuOpenId(null) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-border bg-popover shadow-lg py-1.5 overflow-hidden", children: [
              /* @__PURE__ */ jsxs("button", { onClick: (e) => {
                e.stopPropagation();
                setRenamingId(thread.id);
                setRenameValue(thread.title);
                setMenuOpenId(null);
              }, className: "flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-foreground hover:bg-accent transition-colors", children: [
                /* @__PURE__ */ jsx(PencilLine, { className: "h-3 w-3" }),
                " Rename"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: (e) => {
                e.stopPropagation();
                setMenuOpenId(null);
                deleteThreadMutation.mutate(thread.id);
              }, className: "flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-500/10 transition-colors", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
                " Delete"
              ] })
            ] })
          ] })
        ] }, thread.id))
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 flex flex-col min-w-0 overflow-hidden bg-background", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-12 px-5 border-b border-border shrink-0 bg-card/50 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-foreground", children: activeThreadId ? threads.find((t) => t.id === activeThreadId)?.title ?? "AI Study Assistant" : "AI Study Assistant" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", children: "Powered by Groq · Llama 3.3" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto scrollbar-thin", children: messagesLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 text-muted-foreground animate-spin" }) }) : messages.length === 0 && !streamingContent ? (
        /* — Welcome / empty state — shown only when there are truly no messages — */
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full px-6 py-12 text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-sm", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 text-primary" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground mb-1", children: "How can I help you today?" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-xs", children: "Ask me anything — concepts, quiz questions, flashcards, lab help, or exam prep." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 w-full max-w-xl", children: TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return /* @__PURE__ */ jsxs("button", { onClick: () => handleSend(tmpl.prompt), disabled: isStreaming, className: `flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[.98] ${tmpl.bg}`, children: [
              /* @__PURE__ */ jsx(Icon, { className: `h-4 w-4 mt-0.5 shrink-0 ${tmpl.color}` }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground", children: tmpl.label }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2", children: tmpl.prompt })
              ] })
            ] }, tmpl.label);
          }) })
        ] })
      ) : (
        /* — Message list — always rendered once the first user message is sent — */
        /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-6 space-y-6", children: [
          messages.map((m) => /* @__PURE__ */ jsx(MessageBubble, { message: m }, m.id)),
          streamingId && (streamingContent ? (
            /* Has content → show as normal assistant bubble, updating in place */
            /* @__PURE__ */ jsx(MessageBubble, { message: {
              id: streamingId,
              role: "assistant",
              content: streamingContent
            }, isStreaming: true }, streamingId)
          ) : (
            /* No content yet → show subtle typing dots while waiting for first token */
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 text-primary" }) }),
              /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1 items-center h-4", children: [
                /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" }),
                /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" }),
                /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" })
              ] }) })
            ] })
          )),
          /* @__PURE__ */ jsx("div", { ref: chatEndRef })
        ] })
      ) }),
      /* @__PURE__ */ jsx("div", { className: "shrink-0 border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: `relative flex items-end gap-2 rounded-2xl border transition-all duration-150 bg-background ${isStreaming ? "border-primary/30" : "border-border hover:border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"}`, children: [
          /* @__PURE__ */ jsx("textarea", { ref: inputRef, rows: 1, value: input, onChange: handleInputChange, onKeyDown: handleKeyDown, disabled: isStreaming, placeholder: "Message AI Study Assistant...", className: "flex-1 resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[48px] max-h-[180px] overflow-y-auto scrollbar-thin disabled:opacity-60", style: {
            height: "48px"
          } }),
          /* @__PURE__ */ jsx("button", { onClick: () => isStreaming ? abortRef.current?.abort() : handleSend(), className: `shrink-0 mr-2 mb-2 h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150 ${isStreaming ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : input.trim() ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm" : "bg-muted text-muted-foreground cursor-not-allowed"}`, disabled: !input.trim() && !isStreaming, title: isStreaming ? "Stop generating" : "Send message", children: isStreaming ? /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-[9px] text-muted-foreground/50 mt-1.5", children: "Press Enter to send · Shift+Enter for new line" })
      ] }) })
    ] })
  ] }) });
}
function MessageBubble({
  message,
  isStreaming
}) {
  const isUser = message.role === "user";
  return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 border border-primary/20"}`, children: isUser ? /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 text-primary" }) }),
    /* @__PURE__ */ jsx("div", { className: `max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm"}`, children: /* @__PURE__ */ jsx(MarkdownContent, { content: message.content, isUser, isStreaming }) })
  ] });
}
function MarkdownContent({
  content,
  isUser,
  isStreaming
}) {
  if (isUser) {
    return /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap leading-relaxed", children: content });
  }
  const lines = content.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      elements.push(/* @__PURE__ */ jsx("div", { className: "h-1" }, `gap-${i}`));
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(/* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-primary mt-2 mb-1 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 shrink-0" }),
        line.replace("### ", "")
      ] }, i));
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(/* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-foreground mt-2 mb-1", children: line.replace("## ", "") }, i));
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(/* @__PURE__ */ jsx("h1", { className: "text-base font-bold text-foreground mt-2 mb-1", children: line.replace("# ", "") }, i));
      i++;
      continue;
    }
    if (line.startsWith("---")) {
      elements.push(/* @__PURE__ */ jsx("hr", { className: "border-border my-2" }, i));
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim().toLowerCase();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      const codeText = codeLines.join("\n");
      if (lang === "json") {
        let parsed = null;
        try {
          parsed = JSON.parse(codeText);
        } catch {
        }
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          elements.push(/* @__PURE__ */ jsxs("div", { className: "my-2 rounded-xl overflow-hidden border border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/60 px-3 py-1.5 text-[9px] font-mono text-muted-foreground border-b border-border flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-green-500" }),
              "Structured Data"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-muted/20 px-4 py-3 space-y-1", children: Object.entries(parsed).map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 text-[11px]", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-primary/80 shrink-0", children: [
                k,
                ":"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: typeof v === "object" ? JSON.stringify(v) : String(v) })
            ] }, k)) })
          ] }, `json-${i}`));
        } else {
          elements.push(/* @__PURE__ */ jsxs("div", { className: "my-2 rounded-xl overflow-hidden border border-border", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-muted px-3 py-1 text-[9px] font-mono text-muted-foreground border-b border-border", children: "json" }),
            /* @__PURE__ */ jsx("pre", { className: "bg-muted/50 px-4 py-3 overflow-x-auto scrollbar-thin text-[11px] font-mono text-foreground", children: /* @__PURE__ */ jsx("code", { children: codeText }) })
          ] }, `code-${i}`));
        }
      } else {
        elements.push(/* @__PURE__ */ jsxs("div", { className: "my-2 rounded-xl overflow-hidden border border-border", children: [
          lang && /* @__PURE__ */ jsx("div", { className: "bg-muted px-3 py-1 text-[9px] font-mono text-muted-foreground border-b border-border", children: lang }),
          /* @__PURE__ */ jsx("pre", { className: "bg-muted/50 px-4 py-3 overflow-x-auto scrollbar-thin text-[11px] font-mono text-foreground", children: /* @__PURE__ */ jsx("code", { children: codeText }) })
        ] }, `code-${i}`));
      }
      i++;
      continue;
    }
    if (line.match(/^[\*\-]\s/) || line.match(/^\d+\.\s/)) {
      const listItems = [];
      const isOrdered = line.match(/^\d+\.\s/);
      while (i < lines.length && (lines[i].match(/^[\*\-]\s/) || lines[i].match(/^\d+\.\s/))) {
        const itemText = lines[i].replace(/^[\*\-]\s+/, "").replace(/^\d+\.\s+/, "");
        listItems.push(itemText);
        i++;
      }
      elements.push(isOrdered ? /* @__PURE__ */ jsx("ol", { className: "my-1.5 space-y-1 list-decimal list-inside", children: listItems.map((item, idx) => /* @__PURE__ */ jsx("li", { className: "text-[13px] leading-relaxed text-foreground", children: /* @__PURE__ */ jsx(InlineMarkdown, { text: item }) }, idx)) }, `list-${i}`) : /* @__PURE__ */ jsx("ul", { className: "my-1.5 space-y-1", children: listItems.map((item, idx) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-[13px] leading-relaxed", children: [
        /* @__PURE__ */ jsx("span", { className: "mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(InlineMarkdown, { text: item }) })
      ] }, idx)) }, `list-${i}`));
      continue;
    }
    if (line.startsWith("|")) {
      const tableRows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].includes("---")) {
          const cells = lines[i].split("|").filter(Boolean).map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        elements.push(/* @__PURE__ */ jsx("div", { className: "my-2 overflow-x-auto rounded-xl border border-border", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-[11px]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-muted/60", children: /* @__PURE__ */ jsx("tr", { children: tableRows[0].map((cell, ci) => /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left font-bold text-foreground border-b border-border", children: cell }, ci)) }) }),
          /* @__PURE__ */ jsx("tbody", { children: tableRows.slice(1).map((row, ri) => /* @__PURE__ */ jsx("tr", { className: ri % 2 === 0 ? "bg-background" : "bg-muted/20", children: row.map((cell, ci) => /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-muted-foreground border-b border-border/40", children: cell }, ci)) }, ri)) })
        ] }) }, `table-${i}`));
      }
      continue;
    }
    elements.push(/* @__PURE__ */ jsx("p", { className: "text-[13px] leading-relaxed text-foreground", children: /* @__PURE__ */ jsx(InlineMarkdown, { text: line }) }, i));
    i++;
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
    elements,
    isStreaming && /* @__PURE__ */ jsx("span", { className: "inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle", style: {
      animation: "caretBlink 0.9s step-end infinite"
    } }),
    /* @__PURE__ */ jsx("style", { children: `@keyframes caretBlink { 0%,100%{opacity:1} 50%{opacity:0} }` })
  ] });
}
function InlineMarkdown({
  text
}) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(/* @__PURE__ */ jsx("span", { children: text.slice(lastIndex, match.index) }, key++));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(/* @__PURE__ */ jsx("strong", { className: "font-semibold text-foreground", children: token.slice(2, -2) }, key++));
    } else if (token.startsWith("*")) {
      parts.push(/* @__PURE__ */ jsx("em", { className: "italic", children: token.slice(1, -1) }, key++));
    } else if (token.startsWith("`")) {
      parts.push(/* @__PURE__ */ jsx("code", { className: "px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono text-primary border border-border/60", children: token.slice(1, -1) }, key++));
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(/* @__PURE__ */ jsx("span", { children: text.slice(lastIndex) }, key++));
  }
  return /* @__PURE__ */ jsx(Fragment, { children: parts });
}
export {
  AIAssistantPage as component
};
