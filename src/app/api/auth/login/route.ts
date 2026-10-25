import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashToken, newSessionToken } from "@/lib/auth";
import { rateAllowed } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/origin";
const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateAllowed(`login:${ip}`, 8))
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again shortly." },
      { status: 429 },
    );
  try {
    const v = schema.safeParse(await req.json());
    if (!v.success)
      return NextResponse.json(
        { error: "Enter a valid email and password." },
        { status: 400 },
      );
    const u = await prisma.user.findUnique({
      where: { email: v.data.email.toLowerCase() },
    });
    if (!u || !(await verifyPassword(v.data.password, u.passwordHash)))
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    const token = newSessionToken();
    await prisma.session.create({
      data: {
        userId: u.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    await prisma.auditLog.create({
      data: { userId: u.id, action: "account.login" },
    });
    const res = NextResponse.json({ user: { id: u.id, email: u.email } });
    res.cookies.set("bitrex_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 604800,
    });
    return res;
  } catch {
    return NextResponse.json(
      {
        error: "Sign in unavailable. Configure PostgreSQL and run migrations.",
      },
      { status: 503 },
    );
  }
}
