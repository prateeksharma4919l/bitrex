import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const [users, tx, providers, audit] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.provider.findMany({
        select: { name: true, kind: true, enabled: true, lastHealthAt: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, action: true, resourceId: true, createdAt: true },
      }),
    ]);
    return NextResponse.json({ users, transactions: tx, providers, audit });
  } catch {
    return NextResponse.json(
      { error: "Admin data unavailable." },
      { status: 503 },
    );
  }
}
