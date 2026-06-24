import { supabaseServer } from "@/integrations/supabase/supabase.server";

export type StudentEventType =
    | "ROADMAP_MILESTONE_COMPLETED"
    | "STUDY_TASK_COMPLETED"
    | "NOTES_ANALYZED"
    | "PAPER_ANALYZED"
    | "RESUME_ANALYZED"
    | "CHAT_COMPLETED";

export interface StudentEventPayload {
    [key: string]: unknown;
}

export interface StudentEventRecord {
    id: string;
    user_id: string;
    event_type: StudentEventType;
    payload: StudentEventPayload;
    created_at: string;
}

export interface CreateStudentEventInput {
    user_id: string;
    event_type: StudentEventType;
    payload: StudentEventPayload;
}

export async function createEvent(data: CreateStudentEventInput): Promise<StudentEventRecord> {
    const { data: row, error } = await supabaseServer
        .from('student_events')
        .insert([{
            user_id: data.user_id,
            event_type: data.event_type,
            payload: data.payload ?? {},
        }])
        .select()
        .single();

    if (error || !row) {
        throw new Error("Failed to create student event: " + error?.message);
    }

    return row as StudentEventRecord;
}

export async function getEvents(userId: string): Promise<StudentEventRecord[]> {
    const { data, error } = await supabaseServer
        .from('student_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }

    return (data ?? []) as StudentEventRecord[];
}

export async function getLatestEvents(userId: string, limit = 10): Promise<StudentEventRecord[]> {
    const { data, error } = await supabaseServer
        .from('student_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching latest events:", error);
        return [];
    }

    return (data ?? []) as StudentEventRecord[];
}

export async function deleteOldEvents(userId: string, olderThanDate: string): Promise<number> {
    const { count, error } = await supabaseServer
        .from('student_events')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .lt('created_at', olderThanDate);

    if (error) {
        console.error("Error deleting old events:", error);
        return 0;
    }

    return count ?? 0;
}
