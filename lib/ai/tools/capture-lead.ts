import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import {
  createLead,
  getLeadBySessionId,
  updateLead,
} from "@/lib/db/queries/leads";
import { updateSessionLead } from "@/lib/db/queries/sessions";
import type { UserContext } from "@/lib/user.types";

export const captureLead = tool({
  name: "capture_lead",
  description:
    "Capture a potential buyer's lead information (name and mobile number).",
  parameters: z.object({
    name: z.string().describe("The buyer's full name"),
    mobile: z.string().describe("The buyer's mobile/phone number"),
  }),
  async execute({ name, mobile }, ctx?: RunContext<UserContext>) {
    const { builderId, userId, platform, sessionId } = ctx!.context;

    try {
      const existingLead = await getLeadBySessionId(userId);

      if (existingLead) {
        const updated = await updateLead(existingLead.id, {
          name,
          mobile,
          mobileVerified: platform === "whatsapp" ? true : existingLead.mobileVerified,
        });
        return {
          success: true,
          message:
            platform === "website"
              ? `Thanks ${name}! An OTP has been sent to ${mobile}. Please enter the 4-digit code to verify your number.`
              : `Lead updated for ${name}.`,
          leadId: updated.id,
          requiresOtp: platform === "website",
        };
      }

      const lead = await createLead({
        builderId,
        sessionId,
        userId,
        name,
        mobile,
        platform,
      });

      await updateSessionLead(sessionId, lead.id);

      return {
        success: true,
        message:
          platform === "website"
            ? `Thanks ${name}! An OTP has been sent to ${mobile}. Please enter the 4-digit code to verify your number.`
            : `Lead captured for ${name}.`,
        leadId: lead.id,
        requiresOtp: platform === "website",
      };
    } catch {
      return {
        success: false,
        message: "Failed to capture lead. Please try again.",
      };
    }
  },
});
