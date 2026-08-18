import { c as createSsrRpc } from "./createSsrRpc-CQTokSDO.js";
import { a as createServerFn } from "./server-DkTRikc9.js";
import { z } from "zod";
import { r as requireAdminAuth } from "./admin-middleware-CM2QETWH.js";
const getAdminDashboardStats = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(createSsrRpc("3fc22913957c95863e91e9b8753cee7ebe75251273e0d56c4a5fffa0dca57a75"));
const listAllUsers = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(createSsrRpc("b3ef54427b9b6abe19b4e7fee6274e09e2e5a3e2f0432f352a6e602ed202cfc3"));
const adminUpdateUserRole = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  userId: z.string(),
  role: z.enum(["student", "faculty", "admin"])
})).handler(createSsrRpc("896ab76ea8bbcc92a06d7e3c6b6defd9698bc1123ead9ff29f74c55c6d1cbf66"));
const adminSetUserStatus = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended"])
})).handler(createSsrRpc("1874bcaa1f7b8d1c7babda19ce28452eaa87002b18db0ac257fd4559a07759c5"));
const adminDeleteUser = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  userId: z.string()
})).handler(createSsrRpc("75454526e81445e210b3752ed6012b474b177f745b67b452ea06088e76834860"));
const listAdminAnnouncements = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(createSsrRpc("b2c0b4a153b8f69fd5b764f2fc9e058b45f33dff2fd0df6f58c1c01bfca24dde"));
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
})).handler(createSsrRpc("ac8ecb8a505d3553b0562ae0d181576318ce0e232c00aa4f9ac1179af0fadc62"));
const deleteAdminAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireAdminAuth]).inputValidator(z.object({
  id: z.string()
})).handler(createSsrRpc("f81ce9c2928041d47fc399a614b9626bec0f92f20c2e5852e46ef0789250beb5"));
const listAuditLogs = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(createSsrRpc("775721d220476296bc72ca17a9898845ef187368bc2dc44a284a90c53297939b"));
const getAnalyticsData = createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(createSsrRpc("3c858d3308604a67ebcf29b1b196dcbc67cf43639452d6936f1bae5b9f87978e"));
createServerFn({
  method: "GET"
}).middleware([requireAdminAuth]).handler(createSsrRpc("0b8c54d305a7448366e680721291cd8163ae2012fe94e3a21bb350b012171fa0"));
export {
  adminUpdateUserRole as a,
  adminSetUserStatus as b,
  adminDeleteUser as c,
  listAuditLogs as d,
  listAdminAnnouncements as e,
  createAdminAnnouncement as f,
  getAdminDashboardStats as g,
  deleteAdminAnnouncement as h,
  getAnalyticsData as i,
  listAllUsers as l
};
