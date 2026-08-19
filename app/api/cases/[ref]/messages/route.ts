import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canAccessCase, getMessages } from "@/lib/db/referrals";
import { isPatientVisible } from "@/lib/demo";

// Message thread as JSON, for the polling client (TanStack Query).
//
// This is the app's only JSON endpoint, so it repeats every guard the server
// components rely on rather than assuming the caller got here through the UI:
//
//  · a session is required;
//  · `canAccessCase` re-applies the same per-role scope as every page, so a
//    clinician cannot read a thread on someone else's referral by guessing a
//    case reference;
//  · a patient sees only messages flagged patient-visible, matching the portal.
//
// Not cached: route handlers are uncached by default in this version, and a
// cached thread would serve one clinician's messages to another.
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/cases/[ref]/messages">) {
  const { ref } = await ctx.params;

  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!(await canAccessCase(ref, user))) {
    // 404 rather than 403: whether a case reference exists is itself something
    // an unauthorised caller should not learn.
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const all = await getMessages(ref, user);
  const messages = user.accountType === "patient" ? all.filter(isPatientVisible) : all;

  return Response.json(
    { messages },
    { headers: { "Cache-Control": "no-store" } },
  );
}
