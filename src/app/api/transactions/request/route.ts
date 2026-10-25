import { NextRequest, NextResponse } from "next/server";
import { currentUser, demoMode } from "@/lib/server-auth";
import { rateAllowed } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/origin";
import { moneyRequestSchema } from "@/lib/transaction-validation";
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateAllowed(`financial:${ip}`, 6))
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  const user = await currentUser();
  if (!demoMode() && !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let parsed;
  try {
    parsed = moneyRequestSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid request details." },
      { status: 400 },
    );
  if (demoMode())
    return NextResponse.json(
      {
        status: "SIMULATED",
        simulated: true,
        withdrawable: false,
        message:
          "Demo request acknowledged; no provider call or balance change occurred.",
      },
      { status: 202 },
    );
  return NextResponse.json(
    {
      error:
        "Provider integration is not configured; real money operations are disabled.",
    },
    { status: 503 },
  );
}
