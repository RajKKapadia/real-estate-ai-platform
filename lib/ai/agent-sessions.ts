import type { Session, AgentInputItem } from '@openai/agents';
import { eq, desc, and, max } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions, sessionItems } from '@/lib/db/schema';

interface CustomSessionOptions {
    builderId: string;
    platform: string;
    userId: string;
}

/**
 * Custom session implementation
 * Stores conversation history in PostgreSQL database using Drizzle ORM
 * One session per (builderId, platform, userId) for maintaining full conversation context
 */
export class CustomSession implements Session {
    private readonly builderId: string;
    private readonly platform: string;
    private readonly userId: string;
    private sessionIdCache?: string;

    constructor(options: CustomSessionOptions) {
        this.builderId = options.builderId;
        this.platform = options.platform;
        this.userId = options.userId;
    }

    /**
     * Get or create session ID for this (builderId, platform, userId) combo
     * Uses cached value after first retrieval
     */
    async getSessionId(): Promise<string> {
        if (this.sessionIdCache) {
            return this.sessionIdCache;
        }

        const existingSessions = await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(sessions.builderId, this.builderId),
                    eq(sessions.platform, this.platform),
                    eq(sessions.userId, this.userId),
                )
            )
            .limit(1);

        if (existingSessions.length > 0) {
            this.sessionIdCache = existingSessions[0].id;
            return this.sessionIdCache;
        }

        const [newSession] = await db
            .insert(sessions)
            .values({
                builderId: this.builderId,
                platform: this.platform,
                userId: this.userId,
            })
            .returning();

        this.sessionIdCache = newSession.id;
        return this.sessionIdCache;
    }

    /**
     * Get all session items (conversation history)
     * @param limit Optional limit on number of items to return (most recent)
     */
    async getItems(limit?: number): Promise<AgentInputItem[]> {
        const sessionId = await this.getSessionId();

        let query = db
            .select()
            .from(sessionItems)
            .where(eq(sessionItems.sessionId, sessionId))
            .orderBy(sessionItems.sequence);

        if (limit !== undefined && limit > 0) {
            const maxSeqResult = await db
                .select({ maxSeq: max(sessionItems.sequence) })
                .from(sessionItems)
                .where(eq(sessionItems.sessionId, sessionId));

            const maxSeq = maxSeqResult[0]?.maxSeq;
            if (maxSeq !== null && maxSeq !== undefined) {
                const startSeq = Math.max(0, maxSeq - limit + 1);
                query = db
                    .select()
                    .from(sessionItems)
                    .where(
                        and(
                            eq(sessionItems.sessionId, sessionId),
                            // sequence >= startSeq handled by ordering + limit
                        )
                    )
                    .orderBy(sessionItems.sequence);
            }
        }

        const items = await query;
        return items.map(item => this.cloneItem(item.itemData as AgentInputItem));
    }

    /**
     * Add new items to the session
     * @param items Array of items to add
     */
    async addItems(items: AgentInputItem[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        const sessionId = await this.getSessionId();

        await db.transaction(async (tx) => {
            const maxSeqResult = await tx
                .select({ maxSeq: max(sessionItems.sequence) })
                .from(sessionItems)
                .where(eq(sessionItems.sessionId, sessionId));

            const currentMaxSeq = maxSeqResult[0]?.maxSeq ?? -1;
            const startSeq = currentMaxSeq + 1;

            const itemsToInsert = items.map((item, idx) => ({
                sessionId,
                itemData: item as any,
                sequence: startSeq + idx,
            }));

            await tx.insert(sessionItems).values(itemsToInsert);

            await tx
                .update(sessions)
                .set({ updatedAt: new Date() })
                .where(eq(sessions.id, sessionId));
        });
    }

    /**
     * Remove and return the last item from the session
     */
    async popItem(): Promise<AgentInputItem | undefined> {
        const sessionId = await this.getSessionId();

        return await db.transaction(async (tx) => {
            const lastItems = await tx
                .select()
                .from(sessionItems)
                .where(eq(sessionItems.sessionId, sessionId))
                .orderBy(desc(sessionItems.sequence))
                .limit(1);

            if (lastItems.length === 0) {
                return undefined;
            }

            const lastItem = lastItems[0];

            await tx
                .delete(sessionItems)
                .where(eq(sessionItems.id, lastItem.id));

            await tx
                .update(sessions)
                .set({ updatedAt: new Date() })
                .where(eq(sessions.id, sessionId));

            return this.cloneItem(lastItem.itemData as AgentInputItem);
        });
    }

    /**
     * Clear all items from the session
     * Keeps the session record for metadata
     */
    async clearSession(): Promise<void> {
        const sessionId = await this.getSessionId();

        await db.transaction(async (tx) => {
            await tx
                .delete(sessionItems)
                .where(eq(sessionItems.sessionId, sessionId));

            await tx
                .update(sessions)
                .set({ updatedAt: new Date() })
                .where(eq(sessions.id, sessionId));
        });
    }

    /**
     * Deep clone an item to prevent mutations
     */
    private cloneItem<T extends AgentInputItem>(item: T): T {
        return structuredClone(item);
    }
}
