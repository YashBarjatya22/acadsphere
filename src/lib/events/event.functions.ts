import crypto from "node:crypto";
import { getDb } from "../db.server";

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

export function createEvent(data: CreateStudentEventInput): StudentEventRecord {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const id = crypto.randomUUID();
    const payloadString = JSON.stringify(data.payload ?? {});

    const stmt = db.prepare(`
    INSERT INTO student_events (id, user_id, event_type, payload)
    VALUES (?, ?, ?, ?)
  `);
    stmt.run(id, data.user_id, data.event_type, payloadString);

    const created = getEventById(id);
    if (!created) {
        throw new Error("Failed to create student event");
    }

    return created;
}

export function getEvents(userId: string): StudentEventRecord[] {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    SELECT * FROM student_events
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

    return stmt.all(userId).map((row: any) => ({
        ...row,
        payload: safeParseJson(row.payload),
    })) as StudentEventRecord[];
}

export function getLatestEvents(userId: string, limit = 10): StudentEventRecord[] {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    SELECT * FROM student_events
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

    return stmt.all(userId, limit).map((row: any) => ({
        ...row,
        payload: safeParseJson(row.payload),
    })) as StudentEventRecord[];
}

export function deleteOldEvents(userId: string, olderThanDate: string): number {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    DELETE FROM student_events
    WHERE user_id = ?
      AND created_at < ?
  `);

    const result = stmt.run(userId, olderThanDate);
    return result.changes ?? 0;
}

function getEventById(eventId: string): StudentEventRecord | null {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    SELECT * FROM student_events
    WHERE id = ?
    LIMIT 1
  `);

    const row = stmt.get(eventId);
    return row ? { ...row, payload: safeParseJson(row.payload) } as StudentEventRecord : null;
}

function safeParseJson(payload: unknown): StudentEventPayload {
    if (typeof payload !== "string") {
        return payload as StudentEventPayload;
    }

    try {
        return JSON.parse(payload) as StudentEventPayload;
    } catch {
        return { raw: payload };
    }
}
