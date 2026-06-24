import { supabaseServer } from "@/integrations/supabase/supabase.server";

export type StudentMetricsRecord = {
    id: string;
    user_id: string;
    roadmap_progress: number;
    study_consistency: number;
    notes_coverage: number;
    resume_strength: number;
    placement_readiness: number;
    skill_growth: number;
    success_score: number;
    created_at: string;
    updated_at: string;
};

export type StudentMetricsUpdate = Partial<{
    roadmap_progress: number;
    study_consistency: number;
    notes_coverage: number;
    resume_strength: number;
    placement_readiness: number;
    skill_growth: number;
    success_score: number;
}>;

const DEFAULT_STUDENT_METRICS = {
    roadmap_progress: 0,
    study_consistency: 0,
    notes_coverage: 0,
    resume_strength: 0,
    placement_readiness: 0,
    skill_growth: 0,
    success_score: 0,
};

function clampMetric(value: number): number {
    return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function buildMetricPayload(data: StudentMetricsUpdate): Partial<StudentMetricsRecord> {
    return {
        ...(data.roadmap_progress !== undefined && { roadmap_progress: clampMetric(data.roadmap_progress) }),
        ...(data.study_consistency !== undefined && { study_consistency: clampMetric(data.study_consistency) }),
        ...(data.notes_coverage !== undefined && { notes_coverage: clampMetric(data.notes_coverage) }),
        ...(data.resume_strength !== undefined && { resume_strength: clampMetric(data.resume_strength) }),
        ...(data.placement_readiness !== undefined && { placement_readiness: clampMetric(data.placement_readiness) }),
        ...(data.skill_growth !== undefined && { skill_growth: clampMetric(data.skill_growth) }),
        ...(data.success_score !== undefined && { success_score: clampMetric(data.success_score) }),
    } as Partial<StudentMetricsRecord>;
}

export async function getStudentMetrics(userId: string): Promise<StudentMetricsRecord | null> {
    const { data, error } = await supabaseServer
        .from('student_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching metrics:", error);
    }
    
    return data as StudentMetricsRecord | null;
}

export async function createDefaultMetrics(userId: string): Promise<StudentMetricsRecord> {
    const existing = await getStudentMetrics(userId);
    if (existing) return existing;

    const { data, error } = await supabaseServer
        .from('student_metrics')
        .insert([{
            user_id: userId,
            ...DEFAULT_STUDENT_METRICS
        }])
        .select()
        .single();

    if (error || !data) {
        throw new Error("Failed to create default student metrics: " + error?.message);
    }
    
    return data as StudentMetricsRecord;
}

export async function updateStudentMetrics(userId: string, data: StudentMetricsUpdate): Promise<StudentMetricsRecord> {
    const payload = buildMetricPayload(data);
    if (Object.keys(payload).length === 0) {
        const existing = await getStudentMetrics(userId);
        if (!existing) throw new Error("Student metrics not found");
        return existing;
    }

    // Ensure they exist first
    const existing = await getStudentMetrics(userId);
    if (!existing) {
        await createDefaultMetrics(userId);
    }

    const { data: updated, error } = await supabaseServer
        .from('student_metrics')
        .update({
            ...payload,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error || !updated) {
        throw new Error("Failed to update student metrics: " + error?.message);
    }

    return updated as StudentMetricsRecord;
}
