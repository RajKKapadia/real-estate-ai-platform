import { Queue } from "bullmq";
import { getProducerRedisConnection } from "./connection";

export const whatsappQueue = new Queue("whatsapp-messages", {
  connection: getProducerRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});
