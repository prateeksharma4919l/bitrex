import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashToken, newSessionToken } from "@/lib/auth";
import { rateAllowed } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/origin";
const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(1).max(80),
});
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateAllowed(`register:${ip}`, 5))
    return NextResponse.json(
      { error: "Too many account attempts. Try again shortly." },
      { status: 429 },
    );
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Check your name, email, and password (12+ characters)." },
        { status: 400 },
      );
    const { email, password, name } = parsed.data;
    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (exists)
      return NextResponse.json(
        { error: "Unable to create account with those details." },
        { status: 409 },
      );
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        profile: { create: { displayName: name } },
        auditLogs: { create: { action: "account.registered" } },
      },
      select: { id: true, email: true },
    });
    const token = newSessionToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    const res = NextResponse.json({ user });
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
        error:
          "Account registration unavailable. Configure PostgreSQL and run migrations.",
      },
      { status: 503 },
    );
  }
}
