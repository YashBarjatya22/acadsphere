import { supabaseServer } from "@/integrations/supabase/supabase.server";

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
    if (value === undefined || !Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
}

export async function getKnowledgeProfile(userId: string): Promise<KnowledgeProfileRecord[]> {
    const { data, error } = await supabaseServer
        .from('knowledge_profile')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching knowledge profile:", error);
        return [];
    }

    return (data ?? []) as KnowledgeProfileRecord[];
}

export async function getKnowledgeChunkById(chunkId: string): Promise<KnowledgeProfileRecord | null> {
    const { data, error } = await supabaseServer
        .from('knowledge_profile')
        .select('*')
        .eq('id', chunkId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching knowledge chunk:", error);
    }

    return data as KnowledgeProfileRecord | null;
}

export async function findKnowledgeChunk(userId: string, concept: string, source: KnowledgeSource): Promise<KnowledgeProfileRecord | null> {
    const normalized = normalizeConcept(concept);
    const { data, error } = await supabaseServer
        .from('knowledge_profile')
        .select('*')
        .eq('user_id', userId)
        .ilike('concept', normalized)
        .eq('source', source)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Error finding knowledge chunk:", error);
    }

    return data as KnowledgeProfileRecord | null;
}

export async function createKnowledgeChunk(userId: string, data: KnowledgeProfileCreateInput): Promise<KnowledgeProfileRecord> {
    const concept = normalizeConcept(data.concept);
    if (concept.length === 0) {
        throw new Error("Knowledge concept cannot be empty");
    }

    const existing = await findKnowledgeChunk(userId, concept, data.source);
    if (existing) {
        throw new Error("Knowledge chunk already exists for this concept and source");
    }

    const confidence = clampConfidence(data.confidence);
    const { data: row, error } = await supabaseServer
        .from('knowledge_profile')
        .insert([{ user_id: userId, concept, source: data.source, confidence }])
        .select()
        .single();

    if (error || !row) {
        throw new Error("Failed to create knowledge chunk: " + error?.message);
    }

    return row as KnowledgeProfileRecord;
}

export async function updateKnowledgeChunk(chunkId: string, update: KnowledgeProfileUpdateInput): Promise<KnowledgeProfileRecord> {
    const existing = await getKnowledgeChunkById(chunkId);
    if (!existing) {
        throw new Error("Knowledge chunk not found");
    }

    const concept = update.concept !== undefined ? normalizeConcept(update.concept) : existing.concept;
    if (concept.length === 0) {
        throw new Error("Knowledge concept cannot be empty");
    }

    const source = update.source ?? existing.source;
    const confidence = update.confidence !== undefined ? clampConfidence(update.confidence) : existing.confidence;

    if (concept.toLowerCase() !== existing.concept.toLowerCase() || source !== existing.source) {
        const duplicate = await findKnowledgeChunk(existing.user_id, concept, source);
        if (duplicate && duplicate.id !== chunkId) {
            throw new Error("Another knowledge chunk already exists for this concept and source");
        }
    }

    const { data: updated, error } = await supabaseServer
        .from('knowledge_profile')
        .update({ concept, source, confidence })
        .eq('id', chunkId)
        .select()
        .single();

    if (error || !updated) {
        throw new Error("Failed to update knowledge chunk: " + error?.message);
    }

    return updated as KnowledgeProfileRecord;
}

export async function deleteKnowledgeChunk(chunkId: string): Promise<void> {
    const { error } = await supabaseServer
        .from('knowledge_profile')
        .delete()
        .eq('id', chunkId);

    if (error) {
        throw new Error("Failed to delete knowledge chunk: " + error.message);
    }
}

export async function upsertKnowledgeChunk(userId: string, data: KnowledgeProfileCreateInput): Promise<KnowledgeProfileRecord> {
    const existing = await findKnowledgeChunk(userId, data.concept, data.source);
    if (existing) {
        const confidence = Math.max(existing.confidence, clampConfidence(data.confidence));
        return updateKnowledgeChunk(existing.id, { confidence });
    }

    return createKnowledgeChunk(userId, data);
}
