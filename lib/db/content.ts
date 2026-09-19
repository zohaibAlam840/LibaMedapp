import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FAQS, GLOSSARY, type Faq } from "@/lib/marketing";

// Help content (public FAQ + glossary) as EDITABLE data.
//
// It used to live only in lib/marketing.ts, which is why the admin screen could
// list it but never change it. The table is the source of truth now; the code
// constants remain as the fallback for a database that has not had migration
// 005 applied, so the public page never goes blank mid-deploy.
//
// The fallback is honest here in a way it would not be for clinical data: this
// is marketing copy we wrote, not a record about a patient, and showing the
// previous wording of a public FAQ is not a claim about anything.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  order: number;
  published: boolean;
}

/** True when the content tables exist (migration 005 applied). */
function isMissingTable(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /could not find the table|relation .* does not exist/i.test(msg);
}

const CODE_FAQS: FaqItem[] = FAQS.map((f: Faq, i) => ({
  id: `code-${i}`,
  category: f.category,
  question: f.q,
  answer: f.a,
  order: (i + 1) * 10,
  published: true,
}));

const CODE_GLOSSARY: GlossaryTerm[] = GLOSSARY.map((g, i) => ({
  id: `code-${i}`,
  term: g.term,
  definition: g.def,
  order: (i + 1) * 10,
  published: true,
}));

/** Published questions for the public page; everything for admin. */
export async function getFaqItems(includeHidden = false): Promise<FaqItem[]> {
  if (!configured()) return CODE_FAQS;
  try {
    let query = supabaseAdmin().from("faq_items").select("*").order("display_order");
    if (!includeHidden) query = query.eq("published", true);
    const { data, error } = await query;
    if (error) throw error;
    const rows =
      (data as { id: string; category: string; question: string; answer: string; display_order: number; published: boolean }[] | null) ??
      [];
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      question: r.question,
      answer: r.answer,
      order: r.display_order,
      published: r.published,
    }));
  } catch (e) {
    if (isMissingTable(e)) return CODE_FAQS;
    console.warn("[db] getFaqItems failed:", (e as Error)?.message);
    return CODE_FAQS;
  }
}

export async function getGlossaryTerms(includeHidden = false): Promise<GlossaryTerm[]> {
  if (!configured()) return CODE_GLOSSARY;
  try {
    let query = supabaseAdmin().from("glossary_terms").select("*").order("term");
    if (!includeHidden) query = query.eq("published", true);
    const { data, error } = await query;
    if (error) throw error;
    const rows =
      (data as { id: string; term: string; definition: string; display_order: number; published: boolean }[] | null) ?? [];
    return rows.map((r) => ({
      id: r.id,
      term: r.term,
      definition: r.definition,
      order: r.display_order,
      published: r.published,
    }));
  } catch (e) {
    if (isMissingTable(e)) return CODE_GLOSSARY;
    console.warn("[db] getGlossaryTerms failed:", (e as Error)?.message);
    return CODE_GLOSSARY;
  }
}

/** True when edits can actually persist — the admin screen says so if not. */
export async function contentIsEditable(): Promise<boolean> {
  if (!configured()) return false;
  try {
    const { error } = await supabaseAdmin().from("faq_items").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

/* ── Writes ─────────────────────────────────────────────────────────────── */

export async function upsertFaqItem(item: {
  id?: string;
  category: string;
  question: string;
  answer: string;
  published?: boolean;
}): Promise<void> {
  const sb = supabaseAdmin();
  const payload = {
    category: item.category,
    question: item.question,
    answer: item.answer,
    published: item.published ?? true,
    updated_at: new Date().toISOString(),
  };
  // A "code-" id belongs to the compile-time fallback, not to a row, so it is
  // an insert rather than an update of something that does not exist.
  if (item.id && !item.id.startsWith("code-")) {
    const { error } = await sb.from("faq_items").update(payload).eq("id", item.id);
    if (error) throw error;
    return;
  }
  const { data: last } = await sb
    .from("faq_items")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((last as { display_order?: number } | null)?.display_order ?? 0) + 10;
  const { error } = await sb.from("faq_items").insert({ ...payload, display_order: nextOrder });
  if (error) throw error;
}

export async function deleteFaqItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("faq_items").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertGlossaryTerm(item: {
  id?: string;
  term: string;
  definition: string;
  published?: boolean;
}): Promise<void> {
  const sb = supabaseAdmin();
  const payload = {
    term: item.term,
    definition: item.definition,
    published: item.published ?? true,
    updated_at: new Date().toISOString(),
  };
  if (item.id && !item.id.startsWith("code-")) {
    const { error } = await sb.from("glossary_terms").update(payload).eq("id", item.id);
    if (error) throw error;
    return;
  }
  const { data: last } = await sb
    .from("glossary_terms")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((last as { display_order?: number } | null)?.display_order ?? 0) + 10;
  const { error } = await sb.from("glossary_terms").insert({ ...payload, display_order: nextOrder });
  if (error) throw error;
}

export async function deleteGlossaryTerm(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("glossary_terms").delete().eq("id", id);
  if (error) throw error;
}
