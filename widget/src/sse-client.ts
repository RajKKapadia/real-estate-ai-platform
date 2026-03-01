type Message = { role: "user" | "assistant"; content: string; id: string };

export class SSEClient {
  private apiUrl: string;
  private sessionId: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    this.sessionId =
      this.getStoredSessionId() || this.generateSessionId();
    this.storeSessionId(this.sessionId);
  }

  private getStoredSessionId(): string | null {
    try {
      return localStorage.getItem(`reai_session_${this.extractBuilderId()}`);
    } catch {
      return null;
    }
  }

  private storeSessionId(id: string): void {
    try {
      localStorage.setItem(`reai_session_${this.extractBuilderId()}`, id);
    } catch {
      // localStorage not available
    }
  }

  private extractBuilderId(): string {
    const parts = this.apiUrl.split("/");
    return parts[parts.length - 1] || "default";
  }

  private generateSessionId(): string {
    return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  async sendMessage(
    messages: Message[],
    onChunk: (text: string) => void,
    onDone: (fullText: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        onError(`Error: ${response.status}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError("No response stream");
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        onChunk(fullText);
      }

      onDone(fullText);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Connection failed");
    }
  }
}
