import IORedis from "ioredis";
import { env } from "@/lib/env/server";

let producerConnection: IORedis | null = null;
let workerConnection: IORedis | null = null;

export function getProducerRedisConnection(): IORedis {
  if (!producerConnection) {
    producerConnection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }
  return producerConnection;
}

export function getWorkerRedisConnection(): IORedis {
  if (!workerConnection) {
    workerConnection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return workerConnection;
}
