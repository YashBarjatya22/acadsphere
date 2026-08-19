import { c as createServerRpc } from "./createServerRpc-Cnm9kkK3.js";
import { c as createServerFn, b as getRequest } from "./server-CYaDwdxI.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BnYhSKH5.js";
import { z } from "zod";
import { s as supabaseServer } from "./supabase.server-BXfiGlvE.js";
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
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "@supabase/supabase-js";
import "dotenv";
function formatGoogleDateTime(dueDateObj, dueTimeObj) {
  if (!dueDateObj || !dueDateObj.year || !dueDateObj.month || !dueDateObj.day) {
    return {
      dueDate: null,
      dueTime: null
    };
  }
  const year = dueDateObj.year;
  const month = String(dueDateObj.month).padStart(2, "0");
  const day = String(dueDateObj.day).padStart(2, "0");
  let hours = 23;
  let minutes = 59;
  if (dueTimeObj) {
    hours = dueTimeObj.hours ?? 23;
    minutes = dueTimeObj.minutes ?? 59;
  }
  const isoStr = `${year}-${month}-${day}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`;
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return {
    dueDate: isoStr,
    dueTime: timeStr
  };
}
function sortSubmissions(items) {
  const priority = {
    OVERDUE: 0,
    PENDING: 1,
    SUBMITTED: 2,
    GRADED: 3
  };
  return [...items].sort((a, b) => {
    if (priority[a.state] !== priority[b.state]) {
      return priority[a.state] - priority[b.state];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });
}
async function fetchAllPages(buildUrl, extractItems, getNextToken, token) {
  const results = [];
  let pageToken;
  do {
    const url = buildUrl(pageToken);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) break;
    const data = await res.json();
    const items = extractItems(data);
    if (items?.length) results.push(...items);
    pageToken = getNextToken(data);
  } while (pageToken);
  return results;
}
async function fetchSubmissionState(courseId, cwId, dueDate, token) {
  try {
    const subRes = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${cwId}/studentSubmissions?userId=me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!subRes.ok) {
      const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;
      return {
        state: isOverdue ? "OVERDUE" : "PENDING",
        grade: null
      };
    }
    const subData = await subRes.json();
    const studentSub = subData.studentSubmissions?.[0];
    if (!studentSub) {
      const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;
      return {
        state: isOverdue ? "OVERDUE" : "PENDING",
        grade: null
      };
    }
    const stateRaw = studentSub.state;
    let state = "PENDING";
    let grade = null;
    if (stateRaw === "TURNED_IN") {
      state = studentSub.assignedGrade != null ? "GRADED" : "SUBMITTED";
      grade = studentSub.assignedGrade ?? studentSub.draftGrade ?? null;
    } else if (stateRaw === "RETURNED") {
      state = "GRADED";
      grade = studentSub.assignedGrade ?? studentSub.draftGrade ?? null;
    } else {
      if (dueDate && new Date(dueDate).getTime() < Date.now()) {
        state = "OVERDUE";
      }
    }
    return {
      state,
      grade
    };
  } catch {
    const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;
    return {
      state: isOverdue ? "OVERDUE" : "PENDING",
      grade: null
    };
  }
}
async function processCourse(course, providerToken, cutoff90Days) {
  let latestActivityMs = 0;
  if (course.creationTime) latestActivityMs = new Date(course.creationTime).getTime();
  else if (course.updateTime) latestActivityMs = new Date(course.updateTime).getTime();
  let hasRecentPendingOrOverdue = false;
  let courseWorks = [];
  try {
    courseWorks = await fetchAllPages((pageToken) => `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`, (data) => data.courseWork ?? [], (data) => data.nextPageToken, providerToken);
  } catch {
    return {
      submissions: [],
      latestActivityMs,
      hasRecentPendingOrOverdue
    };
  }
  const submissionResults = await Promise.all(courseWorks.map(async (cw) => {
    try {
      let cwTime = 0;
      if (cw.creationTime) cwTime = new Date(cw.creationTime).getTime();
      else if (cw.updateTime) cwTime = new Date(cw.updateTime).getTime();
      const {
        dueDate,
        dueTime
      } = formatGoogleDateTime(cw.dueDate, cw.dueTime);
      if (dueDate) {
        const dueMs = new Date(dueDate).getTime();
        if (dueMs > cwTime) cwTime = dueMs;
      }
      if (cwTime > latestActivityMs) latestActivityMs = cwTime;
      const {
        state,
        grade
      } = await fetchSubmissionState(course.id, cw.id, dueDate, providerToken);
      if ((state === "PENDING" || state === "OVERDUE") && dueDate) {
        const dueDateMs = new Date(dueDate).getTime();
        if (dueDateMs > cutoff90Days) hasRecentPendingOrOverdue = true;
      } else if (state === "PENDING" && !dueDate) {
        if (cwTime > cutoff90Days) hasRecentPendingOrOverdue = true;
      }
      return {
        id: cw.id,
        title: cw.title || "Untitled Assignment",
        courseName: course.name || "General Subject",
        courseId: course.id,
        dueDate,
        dueTime,
        maxPoints: cw.maxPoints ?? null,
        state,
        alternateLink: cw.alternateLink || `https://classroom.google.com/c/${course.id}/a/${cw.id}`,
        grade,
        description: cw.description || ""
      };
    } catch {
      return null;
    }
  }));
  const submissions = submissionResults.filter((s) => s !== null);
  return {
    submissions,
    latestActivityMs,
    hasRecentPendingOrOverdue
  };
}
const GetSubmissionsInputSchema = z.object({
  providerToken: z.string().optional()
}).optional();
const getClassroomSubmissions_createServerFn_handler = createServerRpc({
  id: "d857efceb3cbcfd44d51141ec68e15e02862fa80f999cfbd0f80a14b83c7327f",
  name: "getClassroomSubmissions",
  filename: "src/lib/classroom.functions.ts"
}, (opts) => getClassroomSubmissions.__executeServer(opts));
const getClassroomSubmissions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => GetSubmissionsInputSchema.parse(input)).handler(getClassroomSubmissions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    user
  } = context;
  const req = getRequest();
  const providerToken = data?.providerToken || req?.headers?.get("x-google-provider-token") || null;
  if (!providerToken) {
    return {
      connected: false,
      coursesCount: 0,
      totalCoursesCount: 0,
      assignments: [],
      userEmail: user?.email ?? void 0,
      error: "MISSING_SCOPES"
    };
  }
  try {
    let courses = [];
    try {
      courses = await fetchAllPages((pageToken) => `https://classroom.googleapis.com/v1/courses?studentId=me&pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`, (data2) => data2.courses ?? [], (data2) => data2.nextPageToken, providerToken);
    } catch {
    }
    if (courses.length === 0) {
      try {
        const fallbackRes = await fetch("https://classroom.googleapis.com/v1/courses?pageSize=50", {
          headers: {
            Authorization: `Bearer ${providerToken}`
          }
        });
        if (fallbackRes.status === 401) {
          return {
            connected: false,
            coursesCount: 0,
            totalCoursesCount: 0,
            assignments: [],
            error: "Google authorization token expired. Please reconnect."
          };
        }
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          courses = fallbackData.courses ?? [];
        }
      } catch {
      }
    }
    const activeCourses = courses.filter((c) => !c.courseState || c.courseState === "ACTIVE");
    const finalCourses = activeCourses.length > 0 ? activeCourses : courses;
    const now = Date.now();
    const cutoff90Days = now - 90 * 86400 * 1e3;
    const courseResults = await Promise.all(finalCourses.map((course) => processCourse(course, providerToken, cutoff90Days)));
    const allSubmissions = [];
    const formattedCoursesList = [];
    let activeCoursesCount = 0;
    for (let i = 0; i < finalCourses.length; i++) {
      const course = finalCourses[i];
      const {
        submissions,
        latestActivityMs,
        hasRecentPendingOrOverdue
      } = courseResults[i];
      const isRecent = latestActivityMs > cutoff90Days;
      const isCurrentSemester = hasRecentPendingOrOverdue || isRecent;
      if (isCurrentSemester) activeCoursesCount++;
      formattedCoursesList.push({
        id: course.id,
        name: course.name || "Untitled Course",
        section: course.section,
        isCurrentSemester
      });
      for (const sub of submissions) {
        allSubmissions.push({
          ...sub,
          isCurrentSemester
        });
      }
    }
    return {
      connected: true,
      coursesCount: activeCoursesCount,
      totalCoursesCount: finalCourses.length,
      assignments: sortSubmissions(allSubmissions),
      courses: formattedCoursesList,
      userEmail: user?.email
    };
  } catch (err) {
    console.warn("Classroom API sync error:", err);
    return {
      connected: false,
      coursesCount: 0,
      totalCoursesCount: 0,
      assignments: [],
      error: err.message || "Failed to reach Google Classroom API"
    };
  }
});
const getCachedClassroomTasks_createServerFn_handler = createServerRpc({
  id: "f767b0c2d1d2c73a2233a3e8ccdc7c004a58a50c840358803513546576b8d4c2",
  name: "getCachedClassroomTasks",
  filename: "src/lib/classroom.functions.ts"
}, (opts) => getCachedClassroomTasks.__executeServer(opts));
const getCachedClassroomTasks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getCachedClassroomTasks_createServerFn_handler, async ({
  context
}) => {
  const {
    user
  } = context;
  const sb = supabaseServer();
  try {
    const {
      data: rows,
      error
    } = await sb.from("classroom_tasks").select("coursework_id, title, course_name, due_date, status").eq("user_id", user.id).order("due_date", {
      ascending: true,
      nullsFirst: false
    });
    if (error || !rows || rows.length === 0) {
      return {
        connected: false,
        coursesCount: 0,
        totalCoursesCount: 0,
        assignments: [],
        fromCache: true
      };
    }
    const now = Date.now();
    const assignments = rows.map((row) => {
      const dueDate = row.due_date ?? null;
      const isOverdue = row.status === "PENDING" && dueDate ? new Date(dueDate).getTime() < now : false;
      const state = row.status === "COMPLETED" ? "SUBMITTED" : isOverdue ? "OVERDUE" : "PENDING";
      return {
        id: row.coursework_id,
        title: row.title,
        courseName: row.course_name,
        courseId: "",
        dueDate,
        dueTime: null,
        maxPoints: null,
        state,
        alternateLink: `https://classroom.google.com`,
        isCurrentSemester: true,
        fromCache: true
      };
    });
    const courseNames = new Set(assignments.map((a) => a.courseName).filter(Boolean));
    return {
      connected: false,
      // still not live-connected; GCR query will replace this
      coursesCount: courseNames.size,
      totalCoursesCount: courseNames.size,
      assignments: sortSubmissions(assignments),
      fromCache: true
    };
  } catch {
    return {
      connected: false,
      coursesCount: 0,
      totalCoursesCount: 0,
      assignments: [],
      fromCache: true
    };
  }
});
export {
  getCachedClassroomTasks_createServerFn_handler,
  getClassroomSubmissions_createServerFn_handler
};
