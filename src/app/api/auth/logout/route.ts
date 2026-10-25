import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth";
import { sameOriginRequest } from "@/lib/origin";
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const jar = await cookies();
  const token = jar.get("bitrex_session")?.value;
  if (token)
    try {
      await prisma.session.deleteMany({
        where: { tokenHash: hashToken(token) },
      });
    } catch {}
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bitrex_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
