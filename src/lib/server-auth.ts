import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth";
export async function currentUser() {
  const token = (await cookies()).get("bitrex_session")?.value;
  if (!token) return null;
  return prisma.user.findFirst({
    where: {
      sessions: {
        some: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
      },
    },
    select: { id: true, email: true, role: true, profile: true },
  });
}
export function demoMode() {
  return (process.env.APP_MODE ?? "DEMO") === "DEMO";
}
