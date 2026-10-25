import { createHash, randomBytes } from "node:crypto";
export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
/** Password hashing adapter. Production deployments should use Argon2id; bcrypt cost 12 is used as portable local fallback. */
export async function hashPassword(password: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(password: string, hash: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}
