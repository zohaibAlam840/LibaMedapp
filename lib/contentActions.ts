"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { appendAdminAudit } from "@/lib/db/write";
import {
  deleteFaqItem,
  deleteGlossaryTerm,
  upsertFaqItem,
  upsertGlossaryTerm,
} from "@/lib/db/content";

// Help & glossary editing.
//
// The admin screen has always listed this content and offered Add/Edit buttons
// that did nothing, because the content lived in lib/marketing.ts where only a
// developer could reach it. It lives in a table now; these are the writes.

export type ContentState = { ok?: boolean; error?: string };

/** Public pages that render this content and must be rebuilt after an edit. */
function revalidateContent(locale: string): void {
  revalidatePath(`/${locale}/faq`);
  revalidatePath(`/${locale}/for-clinicians`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function saveFaqAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return { error: "You don't have permission to edit content." };

  const locale = String(formData.get("locale") || "en");
  const id = String(formData.get("id") || "");
  const category = String(formData.get("category") || "").trim();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();

  if (!question || !answer) return { error: "A question and an answer are both required." };
  if (!category) return { error: "Choose a category." };

  try {
    await upsertFaqItem({
      id: id || undefined,
      category,
      question,
      answer,
      published: formData.get("published") !== "off",
    });
    await appendAdminAudit(admin.name, id ? "FAQ updated" : "FAQ added", question.slice(0, 120));
    revalidateContent(locale);
    return { ok: true };
  } catch (e) {
    const msg = (e as Error)?.message ?? "";
    if (/duplicate key|unique/i.test(msg)) {
      return { error: "There is already a question with that exact wording." };
    }
    return { error: msg || "Could not save that question." };
  }
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return;

  const id = String(formData.get("id") || "");
  const locale = String(formData.get("locale") || "en");
  // A "code-" id is a compile-time fallback entry, not a row: there is nothing
  // to delete, and the migration has not been applied.
  if (!id || id.startsWith("code-")) return;

  try {
    await deleteFaqItem(id);
    await appendAdminAudit(admin.name, "FAQ removed", String(formData.get("question") || id));
    revalidateContent(locale);
  } catch (e) {
    console.warn("[action] deleteFaq failed:", (e as Error)?.message);
  }
}

export async function saveGlossaryAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return { error: "You don't have permission to edit content." };

  const locale = String(formData.get("locale") || "en");
  const id = String(formData.get("id") || "");
  const term = String(formData.get("term") || "").trim();
  const definition = String(formData.get("definition") || "").trim();

  if (!term || !definition) return { error: "A term and a definition are both required." };

  try {
    await upsertGlossaryTerm({
      id: id || undefined,
      term,
      definition,
      published: formData.get("published") !== "off",
    });
    await appendAdminAudit(admin.name, id ? "Glossary updated" : "Glossary added", term);
    revalidateContent(locale);
    return { ok: true };
  } catch (e) {
    const msg = (e as Error)?.message ?? "";
    if (/duplicate key|unique/i.test(msg)) {
      return { error: `"${term}" is already in the glossary.` };
    }
    return { error: msg || "Could not save that term." };
  }
}

export async function deleteGlossaryAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return;

  const id = String(formData.get("id") || "");
  const locale = String(formData.get("locale") || "en");
  if (!id || id.startsWith("code-")) return;

  try {
    await deleteGlossaryTerm(id);
    await appendAdminAudit(admin.name, "Glossary removed", String(formData.get("term") || id));
    revalidateContent(locale);
  } catch (e) {
    console.warn("[action] deleteGlossary failed:", (e as Error)?.message);
  }
}
