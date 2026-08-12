import { c as createSsrRpc } from "./createSsrRpc-CzYOcfyh.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
const LogActivitySchema = z.object({
  activityType: z.enum(["study_session", "milestone", "skill", "streak"]),
  subject: z.string().optional(),
  durationMinutes: z.number().optional(),
  score: z.number().optional(),
  details: z.string().optional()
});
const UpdateProfileSchema = z.object({
  fullName: z.string().min(1),
  degree: z.string().min(1),
  semester: z.string().min(1),
  targetRole: z.string().min(1),
  skills: z.string(),
  examDates: z.string().optional()
});
const getAnalyticsSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b005828a5a239862ffda1c30b4096f5f7146ab3d0881ae9cf70f9a6cdc227aee"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => LogActivitySchema.parse(input)).handler(createSsrRpc("ce937db2f34db99fad64c73d04b3330290ac3d36537bdb0ea521818c16327c0b"));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => UpdateProfileSchema.parse(input)).handler(createSsrRpc("994bc8a09403ee2a686e19815cce4a5b077fb33187b520746fa2c12970b1459c"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("804027459f894fca22604d94977aa13b08f38152865659648ee67205dccab425"));
export {
  getAnalyticsSummary as g,
  updateProfile as u
};
