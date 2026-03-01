import { Agent } from "@openai/agents";
import { buildSystemPrompt } from "./instructions";
import { fetchProjectDetails } from "./tools/fetch-project-details";
import { captureLead } from "./tools/capture-lead";
import { verifyOtp } from "./tools/verify-otp";
import { requestCallback } from "./tools/request-callback";
import type { UserContext } from "@/lib/user.types";
import { REAL_ESTATE_AGENT_MODEL } from "../constants";
import { recordTokenUsage } from "../db/queries/token.usage";

export const realEstateAgent = new Agent<UserContext>({
  name: "Real Estate Agent",
  instructions: buildSystemPrompt,
  model: REAL_ESTATE_AGENT_MODEL,
  tools: [fetchProjectDetails, captureLead, verifyOtp, requestCallback],
});

realEstateAgent.on('agent_start', (ctx, agent) => {
  console.log(`[Agent] Started for user: ${ctx.context.userId}`);
});

realEstateAgent.on('agent_end', async (ctx, output) => {
  console.log(`[Agent] Ended - Tokens: ${ctx.usage.totalTokens} (in: ${ctx.usage.inputTokens}, out: ${ctx.usage.outputTokens})`);

  // Record token usage to database
  try {
      await recordTokenUsage({
          userId: ctx.context.userId,
          inputTokens: ctx.usage.inputTokens,
          outputTokens: ctx.usage.outputTokens,
          totalTokens: ctx.usage.totalTokens,
          model: REAL_ESTATE_AGENT_MODEL,
          operationType: 'message',
      });
  } catch (error) {
      console.error('[Agent] Failed to record token usage:', error);
  }
});

realEstateAgent.on("agent_tool_start", (ctx, tool) => {
  console.log(`[Tool] ${tool.name} started`);
});

realEstateAgent.on("agent_tool_end", async (ctx, tool, output) => {
  console.log(`[Tool] ${tool.name} ended - Tokens: ${ctx.usage.totalTokens}`);
  // Record token usage to database
  try {
      await recordTokenUsage({
          userId: ctx.context.userId,
          inputTokens: ctx.usage.inputTokens,
          outputTokens: ctx.usage.outputTokens,
          totalTokens: ctx.usage.totalTokens,
          model: REAL_ESTATE_AGENT_MODEL,
          operationType: "tool_call",
      });
  } catch (error) {
      console.error('[Agent] Failed to record token usage:', error);
  }
});
