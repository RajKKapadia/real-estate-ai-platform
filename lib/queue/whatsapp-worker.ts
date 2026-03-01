import { Worker, type Job } from "bullmq";
import { run } from "@openai/agents";
import { getWorkerRedisConnection } from "./connection";
import { getBuilderById } from "@/lib/db/queries/builders-detail";
import { getConnectionByType } from "@/lib/db/queries/connections";
import {
  createLead,
  getLeadByMobileAndBuilder,
  updateLead,
} from "@/lib/db/queries/leads";
import { updateSessionLead } from "@/lib/db/queries/sessions";
import { CustomSession } from "@/lib/ai/agent-sessions";
import { sendWhatsAppMessage, markMessageAsRead } from "@/lib/whatsapp/client";
import { decryptIfNeeded } from "@/lib/encryption";
import type { WhatsAppIncomingMessage } from "@/lib/whatsapp/webhook";
import type { UserContext } from "../user.types";
import { realEstateAgent } from "../ai/agent";

type JobData = {
  builderId: string;
  message: WhatsAppIncomingMessage;
};

declare global {
  var __whatsappWorker: Worker<JobData> | undefined;
  var __whatsappWorkerShutdownBound: boolean | undefined;
}

function bindWorkerShutdown() {
  if (globalThis.__whatsappWorkerShutdownBound) return;
  globalThis.__whatsappWorkerShutdownBound = true;

  const shutdown = async (signal: string) => {
    const worker = globalThis.__whatsappWorker;
    if (!worker) return;

    console.log(`[WhatsApp Worker] Received ${signal}, closing worker...`);
    await worker.close();
    globalThis.__whatsappWorker = undefined;
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

export function startWhatsAppWorker() {
  if (globalThis.__whatsappWorker) return globalThis.__whatsappWorker;

  const worker = new Worker<JobData>(
    "whatsapp-messages",
    async (job: Job<JobData>) => {
      const { builderId, message } = job.data;

      const builder = await getBuilderById(builderId);
      if (!builder) throw new Error(`Builder ${builderId} not found`);

      const connection = await getConnectionByType(builderId, "whatsapp");
      if (!connection?.metaAccessToken || !connection?.senderPhoneId) {
        throw new Error("WhatsApp connection not configured");
      }

      const accessToken = decryptIfNeeded(connection.metaAccessToken);
      const senderPhoneId = decryptIfNeeded(connection.senderPhoneId);

      await markMessageAsRead(
        senderPhoneId,
        accessToken,
        message.messageId
      );

      const userId = `conv-whatsapp-${message.from}`;

      const dbSession = new CustomSession({ builderId, platform: "whatsapp", userId });

      const sessionId = await dbSession.getSessionId();

      const existingLead = await getLeadByMobileAndBuilder(message.from, builderId);
      if (!existingLead) {
        const lead = await createLead({
          builderId,
          sessionId,
          userId,
          name: "WhatsApp User",
          mobile: message.from,
          platform: "whatsapp",
        });
        await updateSessionLead(sessionId, lead.id);
      } else if (!existingLead.sessionId) {
        await updateSessionLead(sessionId, existingLead.id);
      }

      if (existingLead && !existingLead.mobileVerified) {
        await updateLead(existingLead.id, { mobileVerified: true });
      }

      const userContext: UserContext = {
        builderId,
        userId,
        platform: "whatsapp",
        mobile: message.from,
        sessionId,
      };

      const result = await run(realEstateAgent, message.text, {
        context: userContext,
        maxTurns: 8,
        session: dbSession,
      });

      const replyText =
        result.finalOutput || "Sorry, I couldn't process that.";

      await sendWhatsAppMessage(
        senderPhoneId,
        accessToken,
        message.from,
        replyText
      );
    },
    {
      connection: getWorkerRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[WhatsApp Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[WhatsApp Worker] Job ${job.id} completed`);
  });

  globalThis.__whatsappWorker = worker;
  bindWorkerShutdown();

  return worker;
}
