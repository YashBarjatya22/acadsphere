import { c as createServerRpc } from "./createServerRpc-Dx-qY5RS.js";
import { a as createServerFn } from "./server-CTRvd-y5.js";
import { z } from "zod";
import { r as requireAdminAuth } from "./admin-middleware-x1X5UcOZ.js";
import { getDb } from "./db.server-DqdqqPAh.js";
import crypto from "node:crypto";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "node:sqlite";
import "node:path";
import "node:dns";
import "@supabase/supabase-js";
const getAdminDashboardStats_createServerFn_handler = createServerRpc({
  id: "3fc22913957c95863e91e9b8753cee7ebe75251273e0d56c4a5fffa0dca57a75",
  name: "getAdminDashboardStats",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminDashboardStats.__executeServer(opts));
const getAdminDashboardStats = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(getAdminDashboardStats_createServerFn_handler, async () => {
  const db = getDb();
  const totalStudents = db.prepare("SELECT COUNT(*) as c FROM students").get()?.c || 0;
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users").get()?.c || 0;
  const todayNotes = db.prepare("SELECT COUNT(*) as c FROM notes_analyses WHERE DATE(created_at) = DATE('now')").get()?.c || 0;
  const totalThreads = db.prepare("SELECT COUNT(*) as c FROM threads").get()?.c || 0;
  const totalMessages = db.prepare("SELECT COUNT(*) as c FROM messages").get()?.c || 0;
  const todayMessages = db.prepare("SELECT COUNT(*) as c FROM messages WHERE DATE(created_at) = DATE('now')").get()?.c || 0;
  const totalAnnouncements = db.prepare("SELECT COUNT(*) as c FROM admin_announcements").get()?.c || 0;
  const newRegistrations = db.prepare("SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = DATE('now')").get()?.c || 0;
  const recentMessages = db.prepare(`
      SELECT m.created_at, u.email, 'AI Query' as activity
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.role = 'user'
      ORDER BY m.created_at DESC LIMIT 5
    `).all() || [];
  const recentNotes = db.prepare(`
      SELECT n.created_at, u.email, 'Note Upload: ' || n.subject as activity
      FROM notes_analyses n
      JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC LIMIT 5
    `).all() || [];
  const recentActivity = [...recentMessages, ...recentNotes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const weeklyActivity = db.prepare(`
      SELECT DATE(created_at) as day, COUNT(*) as count
      FROM messages
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `).all() || [];
  const deptUsage = db.prepare(`
      SELECT department, COUNT(*) as count
      FROM students
      GROUP BY department
      ORDER BY count DESC
    `).all() || [];
  return {
    totalStudents,
    totalUsers,
    onlineStudents: Math.min(Math.floor(totalStudents * 0.3) + 3, totalStudents),
    activeSessions: Math.max(Math.floor(totalStudents * 0.2) + 2, 2),
    todayLogins: Math.floor(totalUsers * 0.4) + 5,
    todayNotes,
    todayAIRequests: todayMessages,
    newRegistrations,
    studentsAtRisk: Math.floor(totalStudents * 0.12),
    totalMessages,
    totalThreads,
    totalAnnouncements,
    recentActivity,
    weeklyActivity,
    deptUsage
  };
});
const listAllUsers_createServerFn_handler = createServerRpc({
  id: "b3ef54427b9b6abe19b4e7fee6274e09e2e5a3e2f0432f352a6e602ed202cfc3",
  name: "listAllUsers",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listAllUsers.__executeServer(opts));
const listAllUsers = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(listAllUsers_createServerFn_handler, async () => {
  const db = getDb();
  const rows = db.prepare(`
      SELECT u.id, u.email, u.status, u.created_at, p.full_name, p.role, p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      ORDER BY u.created_at DESC
    `).all() || [];
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.full_name || r.email.split("@")[0],
    role: r.role || "student",
    status: r.status || "active",
    avatarUrl: r.avatar_url,
    createdAt: r.created_at
  }));
});
const adminUpdateUserRole_createServerFn_handler = createServerRpc({
  id: "896ab76ea8bbcc92a06d7e3c6b6defd9698bc1123ead9ff29f74c55c6d1cbf66",
  name: "adminUpdateUserRole",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateUserRole.__executeServer(opts));
const adminUpdateUserRole = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  userId: z.string(),
  role: z.enum(["student", "faculty", "admin"])
})).handler(adminUpdateUserRole_createServerFn_handler, async ({
  data,
  context
}) => {
  const db = getDb();
  db.prepare("UPDATE profiles SET role = ? WHERE id = ?").run(data.role, data.userId);
  db.prepare("INSERT INTO audit_logs (id, actor_email, action, target, details, status) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), context.user.email, "ROLE_CHANGED", data.userId, `Changed to ${data.role}`, "success");
  return {
    ok: true
  };
});
const adminSetUserStatus_createServerFn_handler = createServerRpc({
  id: "1874bcaa1f7b8d1c7babda19ce28452eaa87002b18db0ac257fd4559a07759c5",
  name: "adminSetUserStatus",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetUserStatus.__executeServer(opts));
const adminSetUserStatus = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended"])
})).handler(adminSetUserStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const db = getDb();
  db.prepare("UPDATE users SET status = ? WHERE id = ?").run(data.status, data.userId);
  db.prepare("INSERT INTO audit_logs (id, actor_email, action, target, details, status) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), context.user.email, data.status === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED", data.userId, null, "success");
  return {
    ok: true
  };
});
const adminDeleteUser_createServerFn_handler = createServerRpc({
  id: "75454526e81445e210b3752ed6012b474b177f745b67b452ea06088e76834860",
  name: "adminDeleteUser",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteUser.__executeServer(opts));
const adminDeleteUser = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  userId: z.string()
})).handler(adminDeleteUser_createServerFn_handler, async ({
  data,
  context
}) => {
  const db = getDb();
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(data.userId);
  db.prepare("DELETE FROM users WHERE id = ?").run(data.userId);
  db.prepare("INSERT INTO audit_logs (id, actor_email, action, target, details, status) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), context.user.email, "USER_DELETED", data.userId, user?.email || "unknown", "success");
  return {
    ok: true
  };
});
const listAdminAnnouncements_createServerFn_handler = createServerRpc({
  id: "b2c0b4a153b8f69fd5b764f2fc9e058b45f33dff2fd0df6f58c1c01bfca24dde",
  name: "listAdminAnnouncements",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listAdminAnnouncements.__executeServer(opts));
const listAdminAnnouncements = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(listAdminAnnouncements_createServerFn_handler, async () => {
  const db = getDb();
  return db.prepare("SELECT * FROM admin_announcements ORDER BY created_at DESC LIMIT 50").all() || [];
});
const createAdminAnnouncement_createServerFn_handler = createServerRpc({
  id: "ac8ecb8a505d3553b0562ae0d181576318ce0e232c00aa4f9ac1179af0fadc62",
  name: "createAdminAnnouncement",
  filename: "src/lib/admin.functions.ts"
}, (opts) => createAdminAnnouncement.__executeServer(opts));
const createAdminAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  audience: z.string().default("all"),
  audienceFilter: z.string().optional(),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional()
})).handler(createAdminAnnouncement_createServerFn_handler, async ({
  data,
  context
}) => {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
      INSERT INTO admin_announcements (id, title, body, audience, audience_filter, priority, scheduled_at, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.body, data.audience, data.audienceFilter || null, data.priority, data.scheduledAt || null, data.expiresAt || null, context.userId);
  db.prepare("INSERT INTO audit_logs (id, actor_email, action, target, details, status) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), context.user.email, "ANNOUNCEMENT_CREATED", id, data.title, "success");
  return {
    ok: true,
    id
  };
});
const deleteAdminAnnouncement_createServerFn_handler = createServerRpc({
  id: "f81ce9c2928041d47fc399a614b9626bec0f92f20c2e5852e46ef0789250beb5",
  name: "deleteAdminAnnouncement",
  filename: "src/lib/admin.functions.ts"
}, (opts) => deleteAdminAnnouncement.__executeServer(opts));
const deleteAdminAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  id: z.string()
})).handler(deleteAdminAnnouncement_createServerFn_handler, async ({
  data,
  context
}) => {
  const db = getDb();
  db.prepare("DELETE FROM admin_announcements WHERE id = ?").run(data.id);
  db.prepare("INSERT INTO audit_logs (id, actor_email, action, target, status) VALUES (?, ?, ?, ?, ?)").run(crypto.randomUUID(), context.user.email, "ANNOUNCEMENT_DELETED", data.id, "success");
  return {
    ok: true
  };
});
const listAuditLogs_createServerFn_handler = createServerRpc({
  id: "775721d220476296bc72ca17a9898845ef187368bc2dc44a284a90c53297939b",
  name: "listAuditLogs",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listAuditLogs.__executeServer(opts));
const listAuditLogs = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(listAuditLogs_createServerFn_handler, async () => {
  const db = getDb();
  return db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200").all() || [];
});
const getAnalyticsData_createServerFn_handler = createServerRpc({
  id: "3c858d3308604a67ebcf29b1b196dcbc67cf43639452d6936f1bae5b9f87978e",
  name: "getAnalyticsData",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAnalyticsData.__executeServer(opts));
const getAnalyticsData = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(getAnalyticsData_createServerFn_handler, async () => {
  const db = getDb();
  const monthlyMessages = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM messages
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `).all() || [];
  const topStudents = db.prepare(`
      SELECT p.full_name as name, COUNT(m.id) as activity, s.department
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      LEFT JOIN messages m ON m.user_id = u.id
      LEFT JOIN students s ON s.id = u.id
      GROUP BY u.id
      ORDER BY activity DESC
      LIMIT 10
    `).all() || [];
  const semesterUsage = db.prepare(`
      SELECT semester, COUNT(*) as count
      FROM students
      GROUP BY semester
      ORDER BY count DESC
    `).all() || [];
  const deptActivity = db.prepare(`
      SELECT s.department, COUNT(m.id) as messages
      FROM students s
      LEFT JOIN messages m ON m.user_id = s.id
      GROUP BY s.department
      ORDER BY messages DESC
    `).all() || [];
  return {
    monthlyMessages,
    topStudents,
    semesterUsage,
    deptActivity
  };
});
const getAdminSettings_createServerFn_handler = createServerRpc({
  id: "0b8c54d305a7448366e680721291cd8163ae2012fe94e3a21bb350b012171fa0",
  name: "getAdminSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminSettings.__executeServer(opts));
const getAdminSettings = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(getAdminSettings_createServerFn_handler, async () => {
  const db = getDb();
  const departments = db.prepare("SELECT DISTINCT department FROM students ORDER BY department").all() || [];
  const semesters = db.prepare("SELECT DISTINCT semester FROM students ORDER BY semester").all() || [];
  const sections = db.prepare("SELECT DISTINCT section FROM students ORDER BY section").all() || [];
  return {
    departments: departments.map((r) => r.department),
    semesters: semesters.map((r) => r.semester),
    sections: sections.map((r) => r.section),
    academicYear: "2025-2026"
  };
});
export {
  adminDeleteUser_createServerFn_handler,
  adminSetUserStatus_createServerFn_handler,
  adminUpdateUserRole_createServerFn_handler,
  createAdminAnnouncement_createServerFn_handler,
  deleteAdminAnnouncement_createServerFn_handler,
  getAdminDashboardStats_createServerFn_handler,
  getAdminSettings_createServerFn_handler,
  getAnalyticsData_createServerFn_handler,
  listAdminAnnouncements_createServerFn_handler,
  listAllUsers_createServerFn_handler,
  listAuditLogs_createServerFn_handler
};
