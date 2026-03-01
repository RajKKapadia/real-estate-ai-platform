import { env } from "@/lib/env/server";

export async function register() {
  const workerInProcessEnv = process.env.WHATSAPP_WORKER_IN_PROCESS;
  const shouldRunInProcess =
    workerInProcessEnv === "true" ||
    (process.env.NODE_ENV === "development" &&
      workerInProcessEnv !== "false");

  if (env.NEXT_RUNTIME === "nodejs" && shouldRunInProcess) {
    const { startWhatsAppWorker } = await import(
      "@/lib/queue/whatsapp-worker"
    );
    startWhatsAppWorker();
    console.log("[Instrumentation] WhatsApp worker started (in-process)");
  }
}
