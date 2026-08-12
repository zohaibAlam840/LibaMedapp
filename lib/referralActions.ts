"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appendAudit, canAccessCase } from "@/lib/db/referrals";
import {
  DOCUMENTS_BUCKET,
  insertDocument,
  insertMessage,
  insertReferral,
  referralIdFromRef,
  updateReferralStatus,
  withdrawConsent,
  type NewReferral,
} from "@/lib/db/write";
import { CASE_STATUS_LABELS, type CaseStatus } from "@/lib/caseStatus";

// Server actions for every clinician-side WRITE. Each one authenticates via the
// session, performs the mutation through the service client, appends an
// immutable audit entry, and revalidates the affected pages. Errors are caught
// and returned to the form (never thrown into the user's face).

export type ActionState = { ok?: boolean; error?: string };

function revalidateCase(locale: string, side: string, ref: string) {
  revalidatePath(`/${locale}/${side}/cases/${ref}`);
  revalidatePath(`/${locale}/${side}/cases/${ref}/messages`);
  revalidatePath(`/${locale}/${side}/cases`);
  revalidatePath(`/${locale}/${side}`);
}

/** Send a message on a case. Referring send → outgoing; receiving send → incoming. */
export async function sendMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const side = String(formData.get("side") || "referring");
  const body = String(formData.get("body") || "").trim();
  if (!ref || !body) return { error: "Write a message before sending." };
  // The ref comes from the client — confirm this session may act on that case.
  if (!(await canAccessCase(ref, user))) return { error: "Case not found." };

  try {
    const ok = await insertMessage(ref, {
      direction: side === "receiving" ? "incoming" : "outgoing",
      body,
      senderId: user.profileId,
      patientVisible: false,
    });
    if (!ok) return { error: "Case not found." };
    await appendAudit(ref, {
      actor: user.name,
      event: "Message sent",
      detail: body.length > 120 ? `${body.slice(0, 117)}…` : body,
    });
    revalidateCase(locale, side, ref);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not send the message." };
  }
}

/** Move a case to a new pipeline status (accept / submit plan / confirm / complete). */
export async function advanceStatusAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const side = String(formData.get("side") || "referring");
  const status = String(formData.get("status") || "") as CaseStatus;
  const event = String(formData.get("event") || `Status → ${CASE_STATUS_LABELS[status] ?? status}`);
  if (!ref || !status) return;
  if (!(await canAccessCase(ref, user))) return;

  try {
    const ok = await updateReferralStatus(ref, status);
    if (ok) {
      await appendAudit(ref, { actor: user.name, event, detail: CASE_STATUS_LABELS[status] });
      revalidateCase(locale, side, ref);
    }
  } catch (e) {
    console.warn("[action] advanceStatus failed:", (e as Error)?.message);
  }
}

/** Withdraw patient consent — halts processing and moves the case terminal. */
export async function withdrawConsentAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const side = String(formData.get("side") || "referring");
  if (!ref) return;
  if (!(await canAccessCase(ref, user))) return;

  try {
    const ok = await withdrawConsent(ref);
    if (ok) {
      await appendAudit(ref, {
        actor: user.name,
        event: "Consent withdrawn",
        detail: "Patient consent withdrawn — further processing halted.",
      });
      revalidateCase(locale, side, ref);
      revalidatePath(`/${locale}/referring/cases/${ref}/consent`);
    }
  } catch (e) {
    console.warn("[action] withdrawConsent failed:", (e as Error)?.message);
  }
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Upload a document to region Storage and attach it to the case. */
export async function uploadDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const side = String(formData.get("side") || "referring");
  const docType = String(formData.get("docType") || "Document");
  const file = formData.get("file");
  if (!ref) return { error: "Case not found." };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > 50 * 1024 * 1024) return { error: "File is too large (50 MB max)." };
  if (!(await canAccessCase(ref, user))) return { error: "Case not found." };

  try {
    const id = await referralIdFromRef(ref);
    if (!id) return { error: "Case not found." };

    const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
    const path = `${ref}/${Date.now()}-${safeName}`;
    const sb = supabaseAdmin();
    const { error: upErr } = await sb.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (upErr) return { error: `Upload failed: ${upErr.message}` };

    await insertDocument(ref, {
      name: file.name,
      type: docType,
      size: humanSize(file.size),
      storagePath: path,
    });
    await appendAudit(ref, {
      actor: user.name,
      event: "Document uploaded",
      detail: `${file.name} (${docType})`,
    });
    revalidateCase(locale, side, ref);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not upload the document." };
  }
}

/**
 * Upload a file chosen during the intake wizard, BEFORE the referral exists.
 * Bytes land in a staging folder keyed to the clinician; the returned path is
 * held in the draft and attached to the case on submit. Without this, files
 * picked in the wizard were recorded by name only and the bytes were lost.
 */
export async function uploadIntakeFileAction(
  formData: FormData,
): Promise<{ ok: true; name: string; size: string; path: string } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session has expired — please sign in again." };

  const file = formData.get("file");
  const docType = String(formData.get("docType") || "Document");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file." };
  if (file.size > 50 * 1024 * 1024) return { ok: false, error: "File is too large (50 MB max)." };

  try {
    const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
    const path = `intake/${user.profileId}/${Date.now()}-${safeName}`;
    const { error } = await supabaseAdmin()
      .storage.from(DOCUMENTS_BUCKET)
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (error) return { ok: false, error: `Upload failed: ${error.message}` };
    return { ok: true, name: file.name, size: humanSize(file.size), path };
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? "Upload failed." };
  }
}

/** Discard a staged intake file the clinician removed before submitting. */
export async function removeIntakeFileAction(path: string): Promise<void> {
  const user = await getSessionUser();
  // Only ever delete inside the caller's own staging folder.
  if (!user || !path.startsWith(`intake/${user.profileId}/`)) return;
  try {
    await supabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove([path]);
  } catch (e) {
    console.warn("[action] removeIntakeFile failed:", (e as Error)?.message);
  }
}

/** Mint a short-lived signed URL to view/download a stored document. */
export async function documentDownloadUrl(
  ref: string,
  storagePath: string,
): Promise<string | null> {
  const user = await getSessionUser();
  if (!user || !storagePath) return null;
  if (!(await canAccessCase(ref, user))) return null;
  try {
    const { data, error } = await supabaseAdmin()
      .storage.from(DOCUMENTS_BUCKET)
      .createSignedUrl(storagePath, 60);
    if (error) return null;
    await appendAudit(ref, { actor: user.name, event: "Document accessed", detail: storagePath });
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

/** Create a new referral from the intake wizard, then land on its confirmation. */
export async function createReferralAction(
  payload: NewReferral & {
    locale: string;
    documents?: { name: string; type: string; size: string; path?: string }[];
  },
): Promise<{ ok: true; ref: string } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "referring") {
    return { ok: false, error: "Only referring clinicians can create a case." };
  }

  try {
    const ref = await insertReferral({
      ...payload,
      referringUserId: user.profileId,
      nsDeclaredBy: payload.nsDeclaredBy || user.name,
    });

    for (const doc of payload.documents ?? []) {
      await insertDocument(ref, { name: doc.name, type: doc.type, size: doc.size, storagePath: doc.path ?? null });
    }
    if (payload.documents?.length) {
      await appendAudit(ref, {
        actor: user.name,
        event: "Documents attached",
        detail: `${payload.documents.length} document(s) attached at intake`,
      });
    }
    await appendAudit(ref, { actor: user.name, event: "Referral created", detail: `Case ${ref} opened` });
    if (payload.nsReason) {
      await appendAudit(ref, {
        actor: user.name,
        event: "NHS non-substitution declared",
        detail: payload.nsJustification ?? undefined,
      });
    }
    if (payload.consent) {
      await appendAudit(ref, {
        actor: user.name,
        event: "Patient consent captured",
        detail: `${payload.consent.items.filter((i) => i.agreed).length} of ${payload.consent.items.length} items · ${payload.consent.version}`,
      });
    }
    revalidatePath(`/${payload.locale}/referring/cases`);
    revalidatePath(`/${payload.locale}/referring`);
    return { ok: true, ref };
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? "Could not create the case." };
  }
}
