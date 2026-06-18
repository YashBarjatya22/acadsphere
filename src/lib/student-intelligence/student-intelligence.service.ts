import { getDb } from "../db.server";
import {
    StudentMetricsRecord,
    getStudentMetrics,
} from "../student-metrics/student-metrics.functions";
import { KnowledgeProfileRecord } from "../knowledge/knowledge.functions";

export interface ProfileRecord {
    id: string;
    full_name: string | null;
    degree: string | null;
    target_role: string | null;
    current_skills: string[];
    created_at: string;
    updated_at: string;
}

export interface StudyPlanSubject {
    name: string;
    examDate: string;
    difficulty: string;
}

export interface StudyPlanRecord {
    id: string;
    user_id: string;
    degree: string;
    semester: string;
    subjects: StudyPlanSubject[];
    result: unknown;
    created_at: string;
}

export interface StudyTaskRecord {
    id: string;
    user_id: string;
    plan_id: string;
    title: string;
    completed: number;
    created_at: string;
}

export interface NotesAnalysisRecord {
    id: string;
    user_id: string;
    file_name: string;
    num_pages: number | null;
    subject: string;
    status: string;
    result: unknown;
    created_at: string;
}

export interface PaperAnalysisRecord {
    id: string;
    user_id: string;
    file_name: string;
    num_pages: number | null;
    status: string;
    result: unknown;
    created_at: string;
}

export interface StudentActivityRecord {
    id: string;
    user_id: string;
    activity_type: string;
    subject: string | null;
    duration_minutes: number | null;
    score: number | null;
    details: unknown;
    created_at: string;
}

export interface StudentState {
    profile: ProfileRecord | null;
    metrics: StudentMetricsRecord | null;
    roadmap: StudyPlanRecord | null;
    study: {
        plans: StudyPlanRecord[];
        tasks: StudyTaskRecord[];
    };
    notes: NotesAnalysisRecord[];
    papers: PaperAnalysisRecord[];
    activities: StudentActivityRecord[];
    knowledgeProfile: KnowledgeProfileRecord[];
}

export function getStudentState(userId: string): StudentState {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const profile = fetchProfile(db, userId);
    const metrics = getStudentMetrics(userId);
    const studyPlans = fetchStudyPlans(db, userId);
    const studyTasks = fetchStudyTasks(db, userId);
    const notes = fetchNotesAnalyses(db, userId);
    const papers = fetchPaperAnalyses(db, userId);
    const activities = fetchStudentActivities(db, userId);
    const knowledgeProfile = fetchKnowledgeProfile(db, userId);

    return {
        profile,
        metrics,
        roadmap: studyPlans.length > 0 ? studyPlans[0] : null,
        study: {
            plans: studyPlans,
            tasks: studyTasks,
        },
        notes,
        papers,
        activities,
        knowledgeProfile,
    };
}

function fetchProfile(db: any, userId: string): ProfileRecord | null {
    const row = db
        .prepare(`
      SELECT * FROM profiles
      WHERE id = ?
      LIMIT 1
    `)
        .get(userId);

    if (!row) return null;

    return {
        ...row,
        current_skills: parseJsonString<string[]>(row.current_skills, []),
    };
}

function fetchStudyPlans(db: any, userId: string): StudyPlanRecord[] {
    return db
        .prepare(`
      SELECT * FROM study_plans
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
        .all(userId)
        .map((row: any) => ({
            ...row,
            subjects: parseJsonString<StudyPlanSubject[]>(row.subjects, []),
            result: parseJsonString<unknown>(row.result, null),
        }));
}

function fetchStudyTasks(db: any, userId: string): StudyTaskRecord[] {
    return db
        .prepare(`
      SELECT * FROM study_tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
        .all(userId) as StudyTaskRecord[];
}

function fetchNotesAnalyses(db: any, userId: string): NotesAnalysisRecord[] {
    return db
        .prepare(`
      SELECT * FROM notes_analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
        .all(userId)
        .map((row: any) => ({
            ...row,
            result: parseJsonString<unknown>(row.result, null),
        }));
}

function fetchPaperAnalyses(db: any, userId: string): PaperAnalysisRecord[] {
    return db
        .prepare(`
      SELECT * FROM paper_analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
        .all(userId)
        .map((row: any) => ({
            ...row,
            result: parseJsonString<unknown>(row.result, null),
        }));
}

function fetchStudentActivities(db: any, userId: string): StudentActivityRecord[] {
    return db
        .prepare(`
      SELECT * FROM student_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
        .all(userId)
        .map((row: any) => ({
            ...row,
            details: parseJsonString<unknown>(row.details, null),
        }));
}

function fetchKnowledgeProfile(db: any, userId: string): KnowledgeProfileRecord[] {
    return db
        .prepare(`
      SELECT * FROM knowledge_profile
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
        .all(userId) as KnowledgeProfileRecord[];
}

function parseJsonString<T>(value: unknown, fallback: T): T {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value !== "string") {
        return value as T;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}
