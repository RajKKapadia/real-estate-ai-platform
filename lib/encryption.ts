import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { env } from "@/lib/env/server";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = env.ENCRYPTION_KEY;
  if (!key) throw new Error("Missing ENCRYPTION_KEY");
  return Buffer.from(key, "hex");
}

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, dataHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}

function looksEncrypted(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;

  const [ivHex, authTagHex, dataHex] = parts;
  const hexPattern = /^[0-9a-f]+$/i;

  return (
    ivHex.length === 24 &&
    authTagHex.length === 32 &&
    dataHex.length > 0 &&
    hexPattern.test(ivHex) &&
    hexPattern.test(authTagHex) &&
    hexPattern.test(dataHex)
  );
}

export function decryptIfNeeded(value: string): string {
  if (!looksEncrypted(value)) return value;

  try {
    return decrypt(value);
  } catch {
    return value;
  }
}
