import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHmac } from "crypto"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "./env/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const algorithm = "aes-256-ctr"

export const encrypt = ({ text }: { text: string }) => {
  const iv = randomBytes(16)
  const key = scryptSync(env.PASSOWRD, "salt", 32)
  const cipher = createCipheriv(algorithm, key, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

export const decrypt = ({ encryptedText }: { encryptedText: string }) => {
  const [ivHex, encryptedHex] = encryptedText.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const encrypted = Buffer.from(encryptedHex, "hex")
  const key = scryptSync(env.PASSOWRD, "salt", 32)
  const decipher = createDecipheriv(algorithm, key, iv)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString()
}
