import crypto from "node:crypto";
import { getDb } from "../db.server";

export type KnowledgeSource = "roadmap" | "paper" | "notes" | "study";

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
    "roadmap",
    "paper",
    "notes",
    "study",
];

export type KnowledgeProfileRecord = {
    id: string;
    user_id: string;
    concept: string;
    source: KnowledgeSource;
    confidence: number;
    created_at: string;
};

export type KnowledgeProfileCreateInput = {
    concept: string;
    source: KnowledgeSource;
    confidence?: number;
};

export type KnowledgeProfileUpdateInput = Partial<{
    concept: string;
    source: KnowledgeSource;
    confidence: number;
}>;

function normalizeConcept(concept: string) {
    return concept.trim().replace(/\s+/g, " ");
}

function clampConfidence(value: number | undefined) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
}

export function getKnowledgeProfile(userId: string): KnowledgeProfileRecord[] {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    SELECT * FROM knowledge_profile
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

    return stmt.all(userId) as KnowledgeProfileRecord[];
}

export function getKnowledgeChunkById(chunkId: string): KnowledgeProfileRecord | null {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
    SELECT * FROM knowledge_profile
    WHERE id = ?
    LIMIT 1
  `);

    const row = stmt.get(chunkId);
    return row ? (row as KnowledgeProfileRecord) : null;
}

export function findKnowledgeChunk(userId: string, concept: string, source: KnowledgeSource): KnowledgeProfileRecord | null {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const normalized = normalizeConcept(concept);
    const stmt = db.prepare(`
    SELECT * FROM knowledge_profile
    WHERE user_id = ?
      AND LOWER(TRIM(concept)) = LOWER(TRIM(?))
      AND source = ?
    LIMIT 1
  `);

    const row = stmt.get(userId, normalized, source);
    return row ? (row as KnowledgeProfileRecord) : null;
}

export function createKnowledgeChunk(userId: string, data: KnowledgeProfileCreateInput): KnowledgeProfileRecord {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const concept = normalizeConcept(data.concept);
    if (concept.length === 0) {
        throw new Error("Knowledge concept cannot be empty");
    }

    const existing = findKnowledgeChunk(userId, concept, data.source);
    if (existing) {
        throw new Error("Knowledge chunk already exists for this concept and source");
    }

    const id = crypto.randomUUID();
    const confidence = clampConfidence(data.confidence);
    const insertStmt = db.prepare(`
    INSERT INTO knowledge_profile (id, user_id, concept, source, confidence)
    VALUES (?, ?, ?, ?, ?)
  `);
    insertStmt.run(id, userId, concept, data.source, confidence);

    const created = getKnowledgeChunkById(id);
    if (!created) {
        throw new Error("Failed to create knowledge chunk");
    }

    return created;
}

export function updateKnowledgeChunk(chunkId: string, data: KnowledgeProfileUpdateInput): KnowledgeProfileRecord {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const existing = getKnowledgeChunkById(chunkId);
    if (!existing) {
        throw new Error("Knowledge chunk not found");
    }

    const concept = data.concept !== undefined ? normalizeConcept(data.concept) : existing.concept;
    if (concept.length === 0) {
        throw new Error("Knowledge concept cannot be empty");
    }

    const source = data.source ?? existing.source;
    const confidence = data.confidence !== undefined ? clampConfidence(data.confidence) : existing.confidence;

    if ((concept.toLowerCase() !== existing.concept.toLowerCase() || source !== existing.source)) {
        const duplicate = findKnowledgeChunk(existing.user_id, concept, source);
        if (duplicate && duplicate.id !== chunkId) {
            throw new Error("Another knowledge chunk already exists for this concept and source");
        }
    }

    const updateStmt = db.prepare(`
    UPDATE knowledge_profile
    SET concept = ?,
        source = ?,
        confidence = ?,
        created_at = created_at
    WHERE id = ?
  `);
    updateStmt.run(concept, source, confidence, chunkId);

    const updated = getKnowledgeChunkById(chunkId);
    if (!updated) {
        throw new Error("Failed to update knowledge chunk");
    }

    return updated;
}

export function deleteKnowledgeChunk(chunkId: string): void {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    db.prepare(`
    DELETE FROM knowledge_profile
    WHERE id = ?
  `).run(chunkId);
}

export function upsertKnowledgeChunk(userId: string, data: KnowledgeProfileCreateInput): KnowledgeProfileRecord {
    const existing = findKnowledgeChunk(userId, data.concept, data.source);
    if (existing) {
        const confidence = Math.max(existing.confidence, clampConfidence(data.confidence));
        return updateKnowledgeChunk(existing.id, { confidence });
    }

    return createKnowledgeChunk(userId, data);
}
