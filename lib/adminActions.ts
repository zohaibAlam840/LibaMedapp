"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appendAdminAudit, updateHospital } from "@/lib/db/write";
import { sendEmail, siteUrl } from "@/lib/email";
import {
  deleteCorridor,
  getCorridorRecord,
  insertCorridor,
  setCorridorSpecialties,
} from "@/lib/db/corridors";
import type { NhsAvailability } from "@/lib/corridors";
import type { Role } from "@/lib/rbac";

// Admin-only write actions: provision accounts (invite) and edit partner
// hospitals. Every action re-checks the caller is a `can_manage_users` admin
// (never trust the client) and writes an admin audit entry.

const CLINICIAN_ROLES: Role[] = ["referring", "receiving", "coordinator", "caseManager", "admin"];

export type InviteState = {
  error?: string;
  ok?: boolean;
  tempPassword?: string;
  email?: string;
  /** Whether the credentials email actually went out. */
  emailed?: boolean;
};

function generatePassword(): string {
  // Human-typeable temporary password: 3 words-ish + digits + symbol.
  const a = Math.random().toString(36).slice(2, 8);
  const b = Math.floor(10 + Math.random() * 89);
  return `Liba-${a}${b}!`;
}

/** Invite (create) a user account with a role. Returns a one-time temp password. */
export async function inviteUserAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) {
    return { error: "You don't have permission to invite users." };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "") as Role | "patient" | "introducer";
  const org = String(formData.get("org") || "").trim();
  const hospitalId = String(formData.get("hospitalId") || "").trim();
  const locale = String(formData.get("locale") || "en");

  if (!name || !email || !role) return { error: "Name, email, and role are required." };

  const password = generatePassword();
  const sb = supabaseAdmin();

  const { data: created, error: authErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr) return { error: authErr.message };
  const authUserId = created.user.id;

  const isClinician = CLINICIAN_ROLES.includes(role as Role);
  const profile: Record<string, unknown> = {
    auth_user_id: authUserId,
    name,
    email,
    account_status: "verified",
    account_type: isClinician ? "clinician" : role, // patient | introducer
    clinician_role: isClinician ? role : null,
    company: org || null,
    hospital_id: hospitalId || null,
    can_manage_users: role === "admin",
    can_export_audit: role === "admin" || role === "caseManager",
    can_edit_corridors: role === "admin",
  };

  const { error: profErr } = await sb.from("profiles").insert(profile);
  if (profErr) {
    await sb.auth.admin.deleteUser(authUserId); // roll back the orphan
    return { error: profErr.message };
  }

  await appendAdminAudit(admin.name, "User invited", `${email} · role ${role}`);

  const sent = await sendEmail({
    to: email,
    subject: "Your LibaMed account",
    body: `${admin.name} has created a LibaMed account for you.

Sign in with this email and the temporary password below, then change it and turn on two-factor authentication straight away.

Temporary password: ${password}`,
    action: { label: "Sign in", url: `${siteUrl()}/${locale}/login` },
    footnote:
      "This password is temporary. If you weren't expecting this account, please contact your administrator.",
  });

  revalidatePath(`/${locale}/admin/users`);
  return { ok: true, tempPassword: password, email, emailed: sent };
}

/* ── Doctors (named clinicians / featured specialists) ──────────────────── */

/** Add a doctor. Admins create approved; coordinators submit for review. */
export async function addDoctorAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  const isAdmin = user.canManageUsers;
  const isCoordinator = user.role === "coordinator";
  if (!isAdmin && !isCoordinator) return { error: "You don't have permission to add clinicians." };

  const locale = String(formData.get("locale") || "en");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  // A coordinator may only ever add to their OWN hospital.
  const hospitalId = isAdmin
    ? String(formData.get("hospitalId") || "").trim()
    : (user.hospitalId ?? "");

  if (!name) return { error: "Name is required." };
  if (!hospitalId) return { error: "Choose a hospital." };

  try {
    const { error } = await supabaseAdmin().from("doctors").insert({
      hospital_id: hospitalId,
      name,
      role: role || null,
      bio: bio || null,
      status: isAdmin ? "approved" : "pending",
    });
    if (error) return { error: error.message };
    await appendAdminAudit(
      user.name,
      "Clinician added",
      `${name} · ${hospitalId}${isAdmin ? "" : " (pending review)"}`,
    );
    revalidatePath(`/${locale}/admin/clinicians`);
    revalidatePath(`/${locale}/receiving/specialists`);
    revalidatePath(`/${locale}/hospitals/${hospitalId}`);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not add the clinician." };
  }
}

/** Approve / reject / feature / unfeature / remove a doctor (admin only). */
export async function updateDoctorAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !user.canManageUsers) return;

  const id = String(formData.get("doctorId") || "");
  const op = String(formData.get("op") || "");
  const locale = String(formData.get("locale") || "en");
  if (!id || !op) return;

  const patch: Record<string, unknown> =
    op === "approve"
      ? { status: "approved" }
      : op === "reject"
        ? { status: "rejected", featured: false }
        : op === "feature"
          ? { featured: true, status: "approved" }
          : op === "unfeature"
            ? { featured: false }
            : {};

  try {
    const sb = supabaseAdmin();
    if (op === "remove") {
      await sb.from("doctors").delete().eq("id", id);
    } else {
      if (Object.keys(patch).length === 0) return;
      await sb.from("doctors").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    }
    await appendAdminAudit(user.name, "Clinician updated", `${op} · ${id}`);
    revalidatePath(`/${locale}/admin/clinicians`);
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/hospitals`);
  } catch (e) {
    console.warn("[action] updateDoctor failed:", (e as Error)?.message);
  }
}

/* ── Corridors ──────────────────────────────────────────────────────────── */

/** Slugify a corridor label into a stable id: "UK → Spain" → "spain". */
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Create a corridor + its specialty list (admin `canEditCorridors`). */
export async function createCorridorAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await getSessionUser();
  if (!user || !user.canEditCorridors) {
    return { error: "You don't have permission to create corridors." };
  }

  const locale = String(formData.get("locale") || "en");
  const country = String(formData.get("country") || "").trim();
  const label = String(formData.get("label") || "").trim() || (country ? `UK → ${country}` : "");
  const explicitId = String(formData.get("corridorId") || "").trim();
  const id = slugify(explicitId || country || label);

  if (!id) return { error: "Enter a country name." };
  if (!label || !country) return { error: "Label and country are required." };

  const transferBasis = String(formData.get("transferBasis") || "scc") as "adequacy" | "scc";
  const residency = String(formData.get("residency") || "").trim() || "UK (London)";
  const safeguard = String(formData.get("safeguard") || "").trim();
  if (!safeguard) return { error: "Safeguard wording is required — it is shown to patients." };

  const notificationAuthority = String(formData.get("notificationAuthority") || "").trim();
  const notificationDaysRaw = String(formData.get("notificationDays") || "").trim();
  const notificationDays = notificationDaysRaw ? Number(notificationDaysRaw) : undefined;
  if (notificationDaysRaw && (!Number.isFinite(notificationDays) || notificationDays! <= 0)) {
    return { error: "Notification window must be a positive number of business days." };
  }

  try {
    if (await getCorridorRecord(id)) {
      return { error: `A corridor with id "${id}" already exists.` };
    }
    await insertCorridor({
      id,
      label,
      country,
      residency,
      transferBasis,
      safeguard,
      notificationAuthority: notificationAuthority || undefined,
      notificationDays,
      primaryHospitalId: String(formData.get("primaryHospitalId") || "").trim() || undefined,
      published: formData.get("published") === "on",
    });

    // Specialties arrive as parallel name[] / nhs[] arrays from the form.
    const names = formData.getAll("specialtyName").map(String);
    const availabilities = formData.getAll("specialtyNhs").map(String);
    const specialties = names
      .map((name, i) => ({
        name: name.trim(),
        nhs: (availabilities[i] ?? "nhs-delayed") as NhsAvailability,
      }))
      .filter((s) => s.name.length > 0);
    if (specialties.length) await setCorridorSpecialties(id, specialties);

    await appendAdminAudit(user.name, "Corridor created", `${label} (${id}) · ${transferBasis}`);
    revalidatePath(`/${locale}/admin/corridors`);
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/for-clinicians`);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not create the corridor." };
  }
}

/** Delete a corridor (blocked while referrals still reference it). */
export async function deleteCorridorAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !user.canEditCorridors) return;

  const id = String(formData.get("corridorId") || "");
  const locale = String(formData.get("locale") || "en");
  if (!id) return;

  try {
    const res = await deleteCorridor(id);
    await appendAdminAudit(
      user.name,
      res.ok ? "Corridor deleted" : "Corridor delete refused",
      res.ok ? id : `${id} · ${res.reason}`,
    );
    revalidatePath(`/${locale}/admin/corridors`);
    revalidatePath(`/${locale}`);
  } catch (e) {
    console.warn("[action] deleteCorridor failed:", (e as Error)?.message);
  }
}

/** Replace a corridor's specialty list (drives intake eligibility gating). */
export async function updateCorridorSpecialtiesAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !user.canEditCorridors) return;

  const id = String(formData.get("corridorId") || "");
  const locale = String(formData.get("locale") || "en");
  if (!id) return;

  const names = formData.getAll("specialtyName").map(String);
  const availabilities = formData.getAll("specialtyNhs").map(String);
  const specialties = names
    .map((name, i) => ({
      name: name.trim(),
      nhs: (availabilities[i] ?? "nhs-delayed") as NhsAvailability,
    }))
    .filter((s) => s.name.length > 0);

  try {
    await setCorridorSpecialties(id, specialties);
    await appendAdminAudit(user.name, "Corridor specialties updated", `${id} · ${specialties.length} specialties`);
    revalidatePath(`/${locale}/admin/corridors`);
    revalidatePath(`/${locale}/referring/intake/corridor`);
  } catch (e) {
    console.warn("[action] updateCorridorSpecialties failed:", (e as Error)?.message);
  }
}

/** Edit corridor presentation + publish state (admin `canEditCorridors`). */
export async function updateCorridorAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !user.canEditCorridors) return;

  const id = String(formData.get("corridorId") || "");
  const locale = String(formData.get("locale") || "en");
  if (!id) return;

  const patch = {
    label: String(formData.get("label") || "").trim(),
    country: String(formData.get("country") || "").trim(),
    residency: String(formData.get("residency") || "").trim(),
    safeguard: String(formData.get("safeguard") || "").trim(),
    published: formData.get("published") === "on",
  };

  try {
    const { error } = await supabaseAdmin().from("corridors").update(patch).eq("id", id);
    if (error) throw error;
    await appendAdminAudit(
      user.name,
      "Corridor updated",
      `${patch.label || id} · ${patch.published ? "published" : "hidden"}`,
    );
    revalidatePath(`/${locale}/admin/corridors`);
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/hospitals`);
  } catch (e) {
    console.warn("[action] updateCorridor failed:", (e as Error)?.message);
  }
}

/** Update a partner hospital (identity + publish + specialties). */
export async function updateHospitalAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return;

  const id = String(formData.get("hospitalId") || "");
  const locale = String(formData.get("locale") || "en");
  if (!id) return;

  const patch = {
    name: String(formData.get("name") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    country: String(formData.get("country") || "").trim(),
    published: formData.get("published") === "on",
    specialties: formData.getAll("specialties").map(String),
  };

  try {
    const ok = await updateHospital(id, patch);
    if (ok) {
      await appendAdminAudit(
        admin.name,
        "Hospital updated",
        `${patch.name} · ${patch.published ? "published" : "hidden"}`,
      );
      revalidatePath(`/${locale}/admin/hospitals`);
      revalidatePath(`/${locale}/admin/hospitals/${id}`);
      revalidatePath(`/${locale}/admin/hospitals/${id}/edit`);
      revalidatePath(`/${locale}/hospitals`);
      revalidatePath(`/${locale}/hospitals/${id}`);
    }
  } catch (e) {
    console.warn("[action] updateHospital failed:", (e as Error)?.message);
  }
}

/**
 * Approve or decline a registration after checking the GMC / FCA register by
 * hand. This is the verification step: no automated lookup exists, so a person
 * confirms the number belongs to the applicant before the account can be used.
 */
export async function decideRegistrationAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return;

  const profileId = String(formData.get("profileId") || "");
  const locale = String(formData.get("locale") || "en");
  const decision = String(formData.get("decision") || "");
  if (!profileId || !["verified", "declined", "pending"].includes(decision)) return;

  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("profiles")
      .update({ account_status: decision })
      .eq("id", profileId)
      .select("name, email, account_type, gmc_number, fca_number")
      .maybeSingle();
    if (error) throw error;

    const p = data as {
      name: string;
      email: string | null;
      account_type: string;
      gmc_number: string | null;
      fca_number: string | null;
    } | null;
    if (!p) return;

    const reg = p.account_type === "introducer"
      ? p.fca_number
        ? `FCA ${p.fca_number}`
        : "employer-verified"
      : p.gmc_number
        ? `GMC ${p.gmc_number}`
        : "no number supplied";

    await appendAdminAudit(
      admin.name,
      decision === "verified" ? "Registration verified" : `Registration ${decision}`,
      `${p.name} (${p.email ?? "no email"}) · ${reg}`,
    );

    // Tell the applicant either way — silence is the worst outcome for them.
    if (p.email && decision !== "pending") {
      if (decision === "verified") {
        await sendEmail({
          to: p.email,
          subject: "Your LibaMed account is approved",
          body: `Good news, ${p.name} — your registration has been verified and your account is ready.\n\nYou can now sign in and create referrals.`,
          action: { label: "Sign in", url: `${siteUrl()}/${locale}/login` },
          footnote:
            "For your patients' security, please turn on two-factor authentication in your account settings.",
        });
      } else {
        await sendEmail({
          to: p.email,
          subject: "About your LibaMed registration",
          body: `Thank you for registering, ${p.name}.\n\nWe weren't able to verify your registration details against the public register, so we can't activate the account at this time.\n\nIf you think this is a mistake — for example the number was mistyped — please reply to this email and we'll take another look.`,
        });
      }
    }

    revalidatePath(`/${locale}/admin/verification`);
    revalidatePath(`/${locale}/admin/users`);
  } catch (e) {
    console.warn("[action] decideRegistration failed:", (e as Error)?.message);
  }
}
