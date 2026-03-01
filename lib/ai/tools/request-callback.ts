import { RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { getLeadById, getLeadByMobileAndBuilder, getLeadBySessionId, updateLead } from "@/lib/db/queries/leads";
import { UserContext } from "@/lib/user.types";

export const requestCallback = tool({
  name: "request_callback",
  description:
    "Request a callback from the builder's sales team for the buyer. Use this when the buyer expresses interest in being contacted or after they've asked several questions about properties.",
  parameters: z.object({
    leadId: z.string().describe("The lead ID to request a callback for"),
    preferred_time: z
      .string()
      .describe(
        "The buyer's preferred time for the callback (e.g. 'morning', 'after 5pm', 'weekends')"
      ),
  }),
  async execute({ preferred_time }, ctx?: RunContext<UserContext>) {
    const { sessionId } = ctx!.context;
    try {
      const lead = await getLeadBySessionId(sessionId);
      if (!lead) {
        return {
          success: false,
          message: "Lead not found. Please capture the lead first.",
        };
      }

      const existingMetadata =
        (lead.metadata as Record<string, unknown>) ?? {};

      await updateLead(lead.id, {
        metadata: {
          ...existingMetadata,
          contact_requested: true,
          preferred_time: preferred_time ?? null,
          callback_requested_at: new Date().toISOString(),
        },
      });

      return {
        success: true,
        message: preferred_time
          ? `Callback requested! The builder's team will contact you ${preferred_time}.`
          : "Callback requested! The builder's team will reach out to you soon.",
      };
    } catch {
      return {
        success: false,
        message: "Failed to request callback. Please try again.",
      };
    }
  },
});
