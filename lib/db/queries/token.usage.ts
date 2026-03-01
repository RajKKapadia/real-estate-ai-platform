import { db } from '../index';
import { tokenUsage, type NewTokenUsage, sessions } from '../schema';
import { eq } from 'drizzle-orm';

export type OperationType = 'message' | 'tool_call' | 'guardrail';

export interface TokenUsageParams {
    userId: string;
    sessionId?: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    model?: string;
    operationType: OperationType;
}

export async function recordTokenUsage(params: TokenUsageParams): Promise<void> {
    try {
        let sessionId = params.sessionId;

        if (!sessionId && params.userId) {
            try {
                const existingSessions = await db
                    .select({ sessionId: sessions.id })
                    .from(sessions)
                    .where(eq(sessions.builderId, params.userId))
                    .limit(1);

                if (existingSessions.length > 0) {
                    sessionId = existingSessions[0].sessionId;
                }
            } catch {
                // Continue without sessionId - it's optional in the schema
            }
        }

        const record: NewTokenUsage = {
            userId: params.userId,
            sessionId: sessionId,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens,
            totalTokens: params.totalTokens,
            model: params.model,
            operationType: params.operationType,
        };

        await db.insert(tokenUsage).values(record);
    } catch (error) {
        throw error;
    }
}
