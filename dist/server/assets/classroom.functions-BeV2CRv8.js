import { c as createServerRpc } from "./createServerRpc-LnQmho66.js";
import { a as createServerFn, g as getRequest } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
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
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
const DEMO_ASSIGNMENTS = [{
  id: "demo-cw-1",
  title: "Lab Assignment 4: BCNF Normalization & PL/SQL Triggers",
  courseName: "MCA301 - Database Management Systems",
  courseId: "c-dbms-101",
  dueDate: new Date(Date.now() - 2 * 864e5).toISOString(),
  // 2 days ago (OVERDUE)
  dueTime: "23:59",
  maxPoints: 20,
  state: "OVERDUE",
  alternateLink: "https://classroom.google.com/c/demo-dbms/a/cw-1",
  description: "Decompose relation R(A,B,C,D) into BCNF. Write PL/SQL row-level triggers for audit logs in table student_enrollment.",
  isCurrentSemester: true
}, {
  id: "demo-cw-2",
  title: "Subnetting & TCP 3-Way Handshake Wireshark Analysis",
  courseName: "MCA303 - Computer Networks & Protocols",
  courseId: "c-cn-103",
  dueDate: new Date(Date.now() + 1 * 864e5).toISOString(),
  // Tomorrow
  dueTime: "23:59",
  maxPoints: 10,
  state: "PENDING",
  alternateLink: "https://classroom.google.com/c/demo-cn/a/cw-2",
  description: "Capture TCP packets using Wireshark during HTTP request. Highlight SYN, SYN-ACK, and ACK sequence numbers with subnet mask calculations.",
  isCurrentSemester: true
}, {
  id: "demo-cw-3",
  title: "Banker's Algorithm & Semaphore Deadlock Avoidance Code",
  courseName: "MCA302 - Operating Systems & Kernel Architecture",
  courseId: "c-os-102",
  dueDate: new Date(Date.now() + 4 * 864e5).toISOString(),
  // In 4 days
  dueTime: "17:00",
  maxPoints: 15,
  state: "PENDING",
  alternateLink: "https://classroom.google.com/c/demo-os/a/cw-3",
  description: "Implement Banker's Safety Algorithm in C/C++ for 5 processes and 3 resource types. Submit clean code with sample test matrices.",
  isCurrentSemester: true
}, {
  id: "demo-cw-4",
  title: "Software Requirement Specification (SRS) & UML Class Diagram",
  courseName: "MCA305 - Software Engineering & Agile Practices",
  courseId: "c-se-105",
  dueDate: new Date(Date.now() - 5 * 864e5).toISOString(),
  dueTime: "23:59",
  maxPoints: 25,
  state: "GRADED",
  grade: 24,
  alternateLink: "https://classroom.google.com/c/demo-se/a/cw-4",
  description: "Prepare IEEE 830 compliant SRS document for AcadSphere SIS portal. Include Use Case diagrams, Sequence diagrams, and ER schemas.",
  isCurrentSemester: true
}, {
  id: "demo-cw-5",
  title: "A* Search & MiniMax Algorithm Implementation in Python",
  courseName: "MCA204 - Artificial Intelligence (Past Term)",
  courseId: "c-ai-104",
  dueDate: new Date(Date.now() - 200 * 864e5).toISOString(),
  dueTime: "23:59",
  maxPoints: 10,
  state: "GRADED",
  grade: 10,
  alternateLink: "https://classroom.google.com/c/demo-ai/a/cw-5",
  description: "Implement 8-Puzzle solver using A* heuristic evaluation. Compare Manhattan distance vs Misplaced tiles heuristic efficiency.",
  isCurrentSemester: false
}, {
  id: "demo-cw-6",
  title: "Docker Containerization & Kubernetes Cluster Manifests",
  courseName: "MCA106 - Cloud Computing (Past Term)",
  courseId: "c-cloud-106",
  dueDate: new Date(Date.now() - 250 * 864e5).toISOString(),
  dueTime: "23:59",
  maxPoints: 15,
  state: "SUBMITTED",
  alternateLink: "https://classroom.google.com/c/demo-cloud/a/cw-6",
  description: "Create Dockerfile for React/Node microservice. Deploy to local Minikube cluster using deployment.yaml and service.yaml configs.",
  isCurrentSemester: false
}];
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
      coursesCount: 4,
      totalCoursesCount: 6,
      assignments: sortSubmissions(DEMO_ASSIGNMENTS),
      userEmail: user?.email ?? "student@acadsphere.edu",
      error: "MISSING_SCOPES"
    };
  }
  try {
    const courses = [];
    let pageToken = void 0;
    do {
      const url = `https://classroom.googleapis.com/v1/courses?studentId=me&pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
      const coursesRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${providerToken}`
        }
      });
      if (!coursesRes.ok) {
        if (courses.length === 0) {
          const fallbackUrl = `https://classroom.googleapis.com/v1/courses?pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: {
              Authorization: `Bearer ${providerToken}`
            }
          });
          if (!fallbackRes.ok) {
            if (fallbackRes.status === 401) {
              return {
                connected: false,
                coursesCount: 0,
                totalCoursesCount: 0,
                assignments: sortSubmissions(DEMO_ASSIGNMENTS),
                error: "Google authorization token expired. Please reconnect."
              };
            }
            throw new Error(`Google API error ${fallbackRes.status}`);
          }
          const fallbackData = await fallbackRes.json();
          if (fallbackData.courses) courses.push(...fallbackData.courses);
          pageToken = fallbackData.nextPageToken;
          continue;
        }
        break;
      }
      const coursesData = await coursesRes.json();
      if (coursesData.courses) {
        courses.push(...coursesData.courses);
      }
      pageToken = coursesData.nextPageToken;
    } while (pageToken);
    const targetCourses = courses.filter((c) => !c.courseState || c.courseState === "ACTIVE");
    const finalCourses = targetCourses.length > 0 ? targetCourses : courses;
    const now = Date.now();
    const cutoff90Days = now - 90 * 86400 * 1e3;
    const courseStore = /* @__PURE__ */ new Map();
    for (const course of finalCourses) {
      let creationMs = 0;
      if (course.creationTime) creationMs = new Date(course.creationTime).getTime();
      else if (course.updateTime) creationMs = new Date(course.updateTime).getTime();
      courseStore.set(course.id, {
        course,
        submissions: [],
        latestActivityMs: creationMs,
        hasRecentPendingOrOverdue: false
      });
    }
    for (const course of finalCourses) {
      const store = courseStore.get(course.id);
      try {
        let cwPageToken = void 0;
        const courseWorks = [];
        do {
          const cwUrl = `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?pageSize=50${cwPageToken ? `&pageToken=${encodeURIComponent(cwPageToken)}` : ""}`;
          const cwRes = await fetch(cwUrl, {
            headers: {
              Authorization: `Bearer ${providerToken}`
            }
          });
          if (!cwRes.ok) break;
          const cwData = await cwRes.json();
          if (cwData.courseWork) courseWorks.push(...cwData.courseWork);
          cwPageToken = cwData.nextPageToken;
        } while (cwPageToken);
        for (const cw of courseWorks) {
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
            if (cwTime > store.latestActivityMs) {
              store.latestActivityMs = cwTime;
            }
            const subRes = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/${cw.id}/studentSubmissions?userId=me`, {
              headers: {
                Authorization: `Bearer ${providerToken}`
              }
            });
            let subState = "PENDING";
            let grade = null;
            if (subRes.ok) {
              const subData = await subRes.json();
              const studentSub = subData.studentSubmissions?.[0];
              if (studentSub) {
                const stateRaw = studentSub.state;
                if (stateRaw === "TURNED_IN") {
                  subState = studentSub.assignedGrade != null ? "GRADED" : "SUBMITTED";
                  grade = studentSub.assignedGrade ?? studentSub.draftGrade ?? null;
                } else if (stateRaw === "RETURNED") {
                  subState = "GRADED";
                  grade = studentSub.assignedGrade ?? studentSub.draftGrade ?? null;
                }
              }
            }
            if (subState === "PENDING" && dueDate) {
              if (new Date(dueDate).getTime() < Date.now()) {
                subState = "OVERDUE";
              }
            }
            if ((subState === "PENDING" || subState === "OVERDUE") && dueDate) {
              const dueDateMs = new Date(dueDate).getTime();
              if (dueDateMs > cutoff90Days) {
                store.hasRecentPendingOrOverdue = true;
              }
            } else if (subState === "PENDING" && !dueDate) {
              if (cwTime > cutoff90Days) {
                store.hasRecentPendingOrOverdue = true;
              }
            }
            store.submissions.push({
              id: cw.id,
              title: cw.title || "Untitled Assignment",
              courseName: course.name || "General Subject",
              courseId: course.id,
              dueDate,
              dueTime,
              maxPoints: cw.maxPoints ?? null,
              state: subState,
              alternateLink: cw.alternateLink || `https://classroom.google.com/c/${course.id}/a/${cw.id}`,
              grade,
              description: cw.description || ""
            });
          } catch (_) {
          }
        }
      } catch (_) {
      }
    }
    const allSubmissions = [];
    const formattedCoursesList = [];
    let activeCoursesCount = 0;
    for (const [_, entry] of courseStore.entries()) {
      const {
        course,
        submissions,
        latestActivityMs,
        hasRecentPendingOrOverdue
      } = entry;
      const isRecent = latestActivityMs > cutoff90Days;
      const isCurrentSemester = hasRecentPendingOrOverdue || isRecent;
      if (isCurrentSemester) {
        activeCoursesCount++;
      }
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
      coursesCount: 4,
      totalCoursesCount: 6,
      assignments: sortSubmissions(DEMO_ASSIGNMENTS),
      error: err.message || "Failed to reach Google Classroom API"
    };
  }
});
export {
  getClassroomSubmissions_createServerFn_handler
};
