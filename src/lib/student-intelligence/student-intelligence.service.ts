import { supabaseServer } from "@/integrations/supabase/supabase.server";
import {
    StudentMetricsRecord,
    getStudentMetrics,
} from "../student-metrics/student-metrics.functions";
import { KnowledgeProfileRecord, getKnowledgeProfile } from "../knowledge/knowledge.functions";

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
    completed: boolean;
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

export async function getStudentState(userId: string): Promise<StudentState> {
    // Fetch everything in parallel for performance
    const [
        profileResult,
        metrics,
        studyPlansResult,
        studyTasksResult,
        notesResult,
        papersResult,
        activitiesResult,
        knowledgeProfile,
    ] = await Promise.all([
        supabaseServer.from('profiles').select('*').eq('id', userId).single(),
        getStudentMetrics(userId),
        supabaseServer.from('study_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabaseServer.from('study_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabaseServer.from('notes_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabaseServer.from('paper_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabaseServer.from('student_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        getKnowledgeProfile(userId),
    ]);

    const profileRow = profileResult.data;
    const profile: ProfileRecord | null = profileRow ? {
        ...profileRow,
        current_skills: Array.isArray(profileRow.current_skills)
            ? profileRow.current_skills
            : (typeof profileRow.current_skills === 'string'
                ? JSON.parse(profileRow.current_skills || '[]')
                : []),
    } : null;

    const studyPlans: StudyPlanRecord[] = (studyPlansResult.data ?? []).map((r: any) => ({
        ...r,
        subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : r.subjects,
        result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
    }));

    const studyTasks: StudyTaskRecord[] = (studyTasksResult.data ?? []) as StudyTaskRecord[];

    const notes: NotesAnalysisRecord[] = (notesResult.data ?? []).map((r: any) => ({
        ...r,
        result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
    }));

    const papers: PaperAnalysisRecord[] = (papersResult.data ?? []).map((r: any) => ({
        ...r,
        result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
    }));

    const activities: StudentActivityRecord[] = (activitiesResult.data ?? []).map((r: any) => ({
        ...r,
        details: typeof r.details === 'string' ? JSON.parse(r.details || 'null') : r.details,
    }));

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
