import { RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { getLeadBySessionId, updateLead } from "@/lib/db/queries/leads";
import { UserContext } from "@/lib/user.types";

export const verifyOtp = tool({
  name: "verify_otp",
  description:
    "Verify the OTP sent to a buyer's mobile number. For demo purposes, any 4-digit OTP is accepted.",
  parameters: z.object({
    leadId: z.string().describe("The lead ID to verify"),
    otp: z.string().describe("The OTP code provided by the buyer"),
  }),
  async execute({ otp }, ctx?: RunContext<UserContext>) {
    const { sessionId } = ctx!.context;
    const lead = await getLeadBySessionId(sessionId);
      if (!lead) {
        return {
          success: false,
          message: "Lead not found. Please capture the lead first.",
        };
      }
    if (!/^\d{4}$/.test(otp)) {
      return {
        verified: false,
        message: "Invalid OTP format. Please enter a 4-digit code.",
      };
    }

    await updateLead(lead.id, { mobileVerified: true });

    return {
      verified: true,
      message: "Phone number verified successfully!",
    };
  },
});
