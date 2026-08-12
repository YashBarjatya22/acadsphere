import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
import { getRequest } from "@tanstack/react-start/server";

export interface SubmissionItem {
  id: string;
  title: string;
  courseName: string;
  courseId: string;
  dueDate: string | null; // ISO String or Formatted Date
  dueTime: string | null;
  maxPoints: number | null;
  state: "PENDING" | "OVERDUE" | "SUBMITTED" | "GRADED";
  alternateLink: string; // Direct URL to assignment on Google Classroom
  grade?: number | null;
  description?: string;
  reviewed?: boolean;
  isCurrentSemester?: boolean;
  fromCache?: boolean; // true when loaded from Supabase cache (not live GCR)
}

export interface CourseItem {
  id: string;
  name: string;
  section?: string;
  isCurrentSemester?: boolean;
}

export interface ClassroomResponse {
  connected: boolean;
  coursesCount: number;
  totalCoursesCount: number;
  assignments: SubmissionItem[];
  courses?: CourseItem[];
  userEmail?: string;
  error?: string;
  fromCache?: boolean; // true when data came from Supabase, not GCR
}

// Helper: Format Google Classroom API Date & Time
function formatGoogleDateTime(dueDateObj?: any, dueTimeObj?: any): { dueDate: string | null; dueTime: string | null } {
  if (!dueDateObj || !dueDateObj.year || !dueDateObj.month || !dueDateObj.day) {
    return { dueDate: null, dueTime: null };
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

  return { dueDate: isoStr, dueTime: timeStr };
}

// Sort submissions: OVERDUE first -> PENDING (earliest due first) -> SUBMITTED/GRADED
function sortSubmissions(items: SubmissionItem[]): SubmissionItem[] {
  const priority = { OVERDUE: 0, PENDING: 1, SUBMITTED: 2, GRADED: 3 };

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

// ─── Fetch all pages for a given Google Classroom paginated endpoint ──────────
async function fetchAllPages<T>(
  buildUrl: (pageToken?: string) => string,
  extractItems: (data: any) => T[],
  getNextToken: (data: any) => string | undefined,
  token: string
): Promise<T[]> {
  const results: T[] = [];
  let pageToken: string | undefined;

  do {
    const url = buildUrl(pageToken);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) break;
    const data = await res.json();
    const items = extractItems(data);
    if (items?.length) results.push(...items);
    pageToken = getNextToken(data);
  } while (pageToken);

  return results;
}

// ─── Fetch student submission state for a single coursework item ──────────────
async function fetchSubmissionState(
  courseId: string,
  cwId: string,
  dueDate: string | null,
  token: string
): Promise<{ state: SubmissionItem["state"]; grade: number | null }> {
  try {
    const subRes = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${cwId}/studentSubmissions?userId=me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!subRes.ok) {
      // Default to PENDING/OVERDUE based on due date
      const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;
      return { state: isOverdue ? "OVERDUE" : "PENDING", grade: null };
    }

    const subData = await subRes.json();
    const studentSub = subData.studentSubmissions?.[0];

    if (!studentSub) {
      const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;
      return { state: isOverdue ? "OVERDUE" : "PENDING", grade: null };
    }

    const stateRaw = studentSub.state;
    let state: SubmissionItem["state"] = "PENDING";
    let grade: number | null = null;

    if (stateRaw === "TURNED_IN") {
      state = studentSub.assignedGrade != null ? "GRADED" : "SUBMITTED";
      grade = studentSub.assignedGrade ?? studentSub.draftGrade ?? null;
    } else if (stateRaw === "RETURNED") {
      state = "GRADED";
      grade = studentSub.assignedGrade ?? studentSub.draftGrade ?? null;
    } else {
      // NEW / CREATED — check if overdue
      if (dueDate && new Date(dueDate).getTime() < Date.now()) {
        state = "OVERDUE";
      }
    }

    return { state, grade };
  } catch {
    const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;
    return { state: isOverdue ? "OVERDUE" : "PENDING", grade: null };
  }
}

// ─── Process a single course: fetch all coursework + submissions in parallel ──
async function processCourse(
  course: any,
  providerToken: string,
  cutoff90Days: number
): Promise<{
  submissions: SubmissionItem[];
  latestActivityMs: number;
  hasRecentPendingOrOverdue: boolean;
}> {
  let latestActivityMs = 0;
  if (course.creationTime) latestActivityMs = new Date(course.creationTime).getTime();
  else if (course.updateTime) latestActivityMs = new Date(course.updateTime).getTime();

  let hasRecentPendingOrOverdue = false;

  // 1. Fetch all courseWork for this course
  let courseWorks: any[] = [];
  try {
    courseWorks = await fetchAllPages(
      (pageToken) =>
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
      (data) => data.courseWork ?? [],
      (data) => data.nextPageToken,
      providerToken
    );
  } catch {
    return { submissions: [], latestActivityMs, hasRecentPendingOrOverdue };
  }

  // 2. Fetch all student submissions in parallel
  const submissionResults = await Promise.all(
    courseWorks.map(async (cw): Promise<SubmissionItem | null> => {
      try {
        // Compute activity timestamp
        let cwTime = 0;
        if (cw.creationTime) cwTime = new Date(cw.creationTime).getTime();
        else if (cw.updateTime) cwTime = new Date(cw.updateTime).getTime();

        const { dueDate, dueTime } = formatGoogleDateTime(cw.dueDate, cw.dueTime);
        if (dueDate) {
          const dueMs = new Date(dueDate).getTime();
          if (dueMs > cwTime) cwTime = dueMs;
        }

        if (cwTime > latestActivityMs) latestActivityMs = cwTime;

        // Fetch submission state in parallel (handled inside fetchSubmissionState)
        const { state, grade } = await fetchSubmissionState(course.id, cw.id, dueDate, providerToken);

        // Flag course as active-semester if there's recent pending/overdue work
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
          description: cw.description || "",
        };
      } catch {
        return null;
      }
    })
  );

  const submissions = submissionResults.filter((s): s is SubmissionItem => s !== null);
  return { submissions, latestActivityMs, hasRecentPendingOrOverdue };
}

const GetSubmissionsInputSchema = z
  .object({
    providerToken: z.string().optional(),
  })
  .optional();

// ─── Main GCR server function (fully parallelized) ───────────────────────────
export const getClassroomSubmissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GetSubmissionsInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { user } = context;

    // Check if request or session contains Google Provider Token
    const req = getRequest();
    const providerToken =
      data?.providerToken ||
      req?.headers?.get("x-google-provider-token") ||
      null;

    if (!providerToken) {
      // Return empty — frontend will show cached data from Supabase
      return {
        connected: false,
        coursesCount: 0,
        totalCoursesCount: 0,
        assignments: [],
        userEmail: user?.email ?? undefined,
        error: "MISSING_SCOPES",
      } as ClassroomResponse;
    }

    try {
      // 1. Fetch ALL enrolled courses (first try with studentId=me, fallback to all)
      let courses: any[] = [];

      try {
        courses = await fetchAllPages(
          (pageToken) =>
            `https://classroom.googleapis.com/v1/courses?studentId=me&pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
          (data) => data.courses ?? [],
          (data) => data.nextPageToken,
          providerToken
        );
      } catch {}

      // Fallback: fetch without studentId filter if first call returned nothing
      if (courses.length === 0) {
        try {
          const fallbackRes = await fetch(
            "https://classroom.googleapis.com/v1/courses?pageSize=50",
            { headers: { Authorization: `Bearer ${providerToken}` } }
          );
          if (fallbackRes.status === 401) {
            return {
              connected: false,
              coursesCount: 0,
              totalCoursesCount: 0,
              assignments: [],
              error: "Google authorization token expired. Please reconnect.",
            } as ClassroomResponse;
          }
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            courses = fallbackData.courses ?? [];
          }
        } catch {}
      }

      // Filter active (non-archived) courses
      const activeCourses = courses.filter((c) => !c.courseState || c.courseState === "ACTIVE");
      const finalCourses = activeCourses.length > 0 ? activeCourses : courses;

      const now = Date.now();
      const cutoff90Days = now - 90 * 86400 * 1000;

      // 2. Process ALL courses in parallel (coursework + submissions fetched concurrently)
      const courseResults = await Promise.all(
        finalCourses.map((course) => processCourse(course, providerToken, cutoff90Days))
      );

      // 3. Classify courses and assemble final submission list
      const allSubmissions: SubmissionItem[] = [];
      const formattedCoursesList: CourseItem[] = [];
      let activeCoursesCount = 0;

      for (let i = 0; i < finalCourses.length; i++) {
        const course = finalCourses[i];
        const { submissions, latestActivityMs, hasRecentPendingOrOverdue } = courseResults[i];

        const isRecent = latestActivityMs > cutoff90Days;
        const isCurrentSemester = hasRecentPendingOrOverdue || isRecent;

        if (isCurrentSemester) activeCoursesCount++;

        formattedCoursesList.push({
          id: course.id,
          name: course.name || "Untitled Course",
          section: course.section,
          isCurrentSemester,
        });

        for (const sub of submissions) {
          allSubmissions.push({ ...sub, isCurrentSemester });
        }
      }

      return {
        connected: true,
        coursesCount: activeCoursesCount,
        totalCoursesCount: finalCourses.length,
        assignments: sortSubmissions(allSubmissions),
        courses: formattedCoursesList,
        userEmail: user?.email,
      } as ClassroomResponse;

    } catch (err: any) {
      console.warn("Classroom API sync error:", err);
      return {
        connected: false,
        coursesCount: 0,
        totalCoursesCount: 0,
        assignments: [],
        error: err.message || "Failed to reach Google Classroom API",
      } as ClassroomResponse;
    }
  });

// ─── Optimistic Cache: read classroom_tasks from Supabase ────────────────────
export const getCachedClassroomTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { user } = context;
    const sb = supabaseServer();

    try {
      const { data: rows, error } = await sb
        .from("classroom_tasks")
        .select("coursework_id, title, course_name, due_date, status")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error || !rows || rows.length === 0) {
        return {
          connected: false,
          coursesCount: 0,
          totalCoursesCount: 0,
          assignments: [],
          fromCache: true,
        } as ClassroomResponse;
      }

      const now = Date.now();

      const assignments: SubmissionItem[] = rows.map((row: {
        coursework_id: string;
        title: string;
        course_name: string;
        due_date: string | null;
        status: string;
      }) => {
        const dueDate = row.due_date ?? null;
        const isOverdue =
          row.status === "PENDING" && dueDate
            ? new Date(dueDate).getTime() < now
            : false;

        const state: SubmissionItem["state"] =
          row.status === "COMPLETED"
            ? "SUBMITTED"
            : isOverdue
            ? "OVERDUE"
            : "PENDING";

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
          fromCache: true,
        };
      });

      // Derive unique course names for count
      const courseNames = new Set(assignments.map((a) => a.courseName).filter(Boolean));

      return {
        connected: false, // still not live-connected; GCR query will replace this
        coursesCount: courseNames.size,
        totalCoursesCount: courseNames.size,
        assignments: sortSubmissions(assignments),
        fromCache: true,
      } as ClassroomResponse;

    } catch {
      return {
        connected: false,
        coursesCount: 0,
        totalCoursesCount: 0,
        assignments: [],
        fromCache: true,
      } as ClassroomResponse;
    }
  });
