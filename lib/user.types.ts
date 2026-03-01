export interface UserContext {
    builderId: string;
    platform: "website" | "whatsapp";
    userId: string;
    sessionId: string;
    mobile?: string;
}
