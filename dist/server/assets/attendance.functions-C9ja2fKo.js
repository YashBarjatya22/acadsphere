import { c as createSsrRpc } from "./createSsrRpc-CQTokSDO.js";
import { a as createServerFn } from "./server-DkTRikc9.js";
import { z } from "zod";
const syncAttendanceToLocalDb = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  userId: z.string().optional(),
  subjects: z.array(z.any())
})).handler(createSsrRpc("d772552b1bebca97f813c0b3e50d4285ad4358c04b792cc4f3eb0d9a542c76e0"));
const getAttendanceDashboardData = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  userId: z.string().optional()
}).optional()).handler(createSsrRpc("122bef2cf6d933bceb9ed73f2b8c84032d7c384f0a49796cdb7afb2afa6ddce6"));
const updateSubjectAttendance = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  subjectId: z.string(),
  action: z.enum(["present", "absent", "reset"])
})).handler(createSsrRpc("88709e54f3739efe25d062a150d5c6b95e3273d0275843aeb2f0d81a386006e3"));
const markNotificationRead = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  notificationId: z.string()
})).handler(createSsrRpc("a83ea5f608e7f3035543c233e3129885c03a3448bb6e729bb5fa139700cc727d"));
const deleteNotification = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  notificationId: z.string()
})).handler(createSsrRpc("b55efa7a6209666175f7467c0f5ccf6fe5475d4a096adab3d742ffeda2156fc1"));
export {
  deleteNotification as d,
  getAttendanceDashboardData as g,
  markNotificationRead as m,
  syncAttendanceToLocalDb as s,
  updateSubjectAttendance as u
};
