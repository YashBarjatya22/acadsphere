import crypto from "node:crypto";
import { getDb } from "../db.server";

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

export function getStudentMetrics(userId: string): StudentMetricsRecord | null {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    SELECT * FROM student_metrics
    WHERE user_id = ?
    LIMIT 1
  `);
    const row = stmt.get(userId);
    return row ? (row as StudentMetricsRecord) : null;
}

export function createDefaultMetrics(userId: string): StudentMetricsRecord {
    const existing = getStudentMetrics(userId);
    if (existing) return existing;

    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const id = crypto.randomUUID();
    const insertStmt = db.prepare(`
    INSERT INTO student_metrics (
      id,
      user_id,
      roadmap_progress,
      study_consistency,
      notes_coverage,
      resume_strength,
      placement_readiness,
      skill_growth,
      success_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertStmt.run(
        id,
        userId,
        DEFAULT_STUDENT_METRICS.roadmap_progress,
        DEFAULT_STUDENT_METRICS.study_consistency,
        DEFAULT_STUDENT_METRICS.notes_coverage,
        DEFAULT_STUDENT_METRICS.resume_strength,
        DEFAULT_STUDENT_METRICS.placement_readiness,
        DEFAULT_STUDENT_METRICS.skill_growth,
        DEFAULT_STUDENT_METRICS.success_score,
    );

    const created = getStudentMetrics(userId);
    if (!created) {
        throw new Error("Failed to create default student metrics");
    }
    return created;
}

export function updateStudentMetrics(userId: string, data: StudentMetricsUpdate): StudentMetricsRecord {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const payload = buildMetricPayload(data);
    if (Object.keys(payload).length === 0) {
        const existing = getStudentMetrics(userId);
        if (!existing) throw new Error("Student metrics not found");
        return existing;
    }

    const metrics = getStudentMetrics(userId) ?? createDefaultMetrics(userId);

    const stmt = db.prepare(`
    UPDATE student_metrics
    SET roadmap_progress = ?,
        study_consistency = ?,
        notes_coverage = ?,
        resume_strength = ?,
        placement_readiness = ?,
        skill_growth = ?,
        success_score = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `);

    stmt.run(
        payload.roadmap_progress ?? metrics.roadmap_progress,
        payload.study_consistency ?? metrics.study_consistency,
        payload.notes_coverage ?? metrics.notes_coverage,
        payload.resume_strength ?? metrics.resume_strength,
        payload.placement_readiness ?? metrics.placement_readiness,
        payload.skill_growth ?? metrics.skill_growth,
        payload.success_score ?? metrics.success_score,
        userId,
    );

    const updated = getStudentMetrics(userId);
    if (!updated) {
        throw new Error("Failed to update student metrics");
    }

    return updated;
}
