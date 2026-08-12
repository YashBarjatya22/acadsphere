import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { ShieldAlert, Power, Monitor, AlertTriangle, Shield, Key, RefreshCw } from "lucide-react";
import { B as Button } from "./button-CUmEMVhO.js";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const INITIAL_SESSIONS = [{
  id: "sess-1",
  user: "John Doe",
  usn: "1CR22CS045",
  role: "Student",
  ip: "192.168.1.104",
  device: "Chrome / Windows 11",
  location: "Bengaluru, IN",
  loginTime: "9:12 AM Today",
  status: "Active"
}, {
  id: "sess-2",
  user: "Evana Joseph",
  usn: "1CR22CS088",
  role: "Student",
  ip: "192.168.1.145",
  device: "Edge / Windows 11",
  location: "Bengaluru, IN",
  loginTime: "9:30 AM Today",
  status: "Active"
}, {
  id: "sess-3",
  user: "Rahul Kumar",
  usn: "1CR22EC012",
  role: "Student",
  ip: "192.168.1.189",
  device: "Chrome / Android",
  location: "Bengaluru, IN",
  loginTime: "9:05 AM Today",
  status: "Active"
}, {
  id: "sess-4",
  user: "Unknown Account Attempt",
  usn: "1CR22CS999",
  role: "Unknown",
  ip: "45.122.18.90",
  device: "Python Requests Script",
  location: "Unknown Remote",
  loginTime: "8:50 AM Today",
  status: "Suspicious"
}];
const FAILED_LOGINS = [{
  id: "f1",
  email: "student.test@acadsphere.edu",
  ip: "192.168.1.105",
  reason: "Invalid Password (3 attempts)",
  timestamp: "9:42 AM Today",
  status: "Locked (15 mins)"
}, {
  id: "f2",
  email: "admin.hack@external.com",
  ip: "185.220.101.5",
  reason: "Blocked IP Range",
  timestamp: "8:15 AM Today",
  status: "Permanent Block"
}, {
  id: "f3",
  email: "jane.smith@acadsphere.edu",
  ip: "192.168.1.112",
  reason: "MFA Timeout",
  timestamp: "Yesterday 6:30 PM",
  status: "Resolved"
}];
function AdminSecurityPage() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  function terminateSession(id, user) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success(`Session terminated for ${user}`);
  }
  function terminateAllSessions() {
    setSessions([]);
    toast.success("All non-administrative sessions forcibly terminated.");
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-white tracking-tight", children: "Security & Active Session Controls" }),
          /* @__PURE__ */ jsxs("span", { className: "bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(ShieldAlert, { className: "h-2.5 w-2.5" }),
            " High Security Zone"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Monitor active web connections, force end sessions, review failed authentication logs, and manage institutional access controls." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Button, { onClick: terminateAllSessions, className: "h-9 text-xs gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/30", children: [
        /* @__PURE__ */ jsx(Power, { className: "h-3.5 w-3.5" }),
        " Force Logout All Sessions"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0", children: /* @__PURE__ */ jsx(Monitor, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-slate-400 tracking-wider", children: "Active Sessions" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-white mt-0.5", children: sessions.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-slate-400 tracking-wider", children: "Failed Logins (24h)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-amber-400 mt-0.5", children: FAILED_LOGINS.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-slate-400 tracking-wider", children: "Firewall Status" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-emerald-400 mt-0.5", children: "Enforced" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0", children: /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-slate-400 tracking-wider", children: "MFA Requirement" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-violet-400 mt-0.5", children: "Optional" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white", children: "Active System Sessions" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Live active sessions connected to AcadSphere ERP." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => toast.success("Refreshed active session list"), variant: "outline", className: "h-8 text-xs gap-1 bg-slate-900 border-slate-700 text-slate-300", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
          " Refresh"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase text-[9.5px] tracking-wider", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "User" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Role" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "IP Address" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Device & Browser" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Location" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Login Time" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-800/80", children: sessions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "text-center py-8 text-slate-500 font-mono", children: "No active user sessions found." }) }) : sessions.map((s) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-900/60 transition-colors", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 font-bold text-white", children: [
            s.user,
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 font-mono", children: [
              "(",
              s.usn,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: "bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold", children: s.role }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono text-blue-400", children: s.ip }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-300 font-mono", children: s.device }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-400", children: s.location }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono text-slate-400", children: s.loginTime }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: s.status === "Active" ? /* @__PURE__ */ jsx("span", { className: "text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", children: "Active" }) : /* @__PURE__ */ jsx("span", { className: "text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30", children: "Suspicious" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx("button", { onClick: () => terminateSession(s.id, s.user), className: "px-2.5 py-1 text-[10px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg border border-red-500/20 transition-all", children: "Force End" }) })
        ] }, s.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b border-slate-800", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white", children: "Failed Login & Threat Tracker" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Recent rejected authentication attempts across institution endpoints." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs font-mono", children: FAILED_LOGINS.map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("p", { className: "text-white font-bold text-xs", children: [
              f.email,
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-slate-400", children: [
                "(",
                f.ip,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-[10.5px] mt-0.5", children: f.reason })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("span", { className: "inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-800 text-amber-400 border border-slate-700", children: f.status }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-[10px] mt-1", children: f.timestamp })
        ] })
      ] }, f.id)) })
    ] })
  ] });
}
export {
  AdminSecurityPage as component
};
