"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus, TriangleAlert, X } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import SubmitButton from "@/components/ui/SubmitButton";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import {
  deleteFaqAction,
  deleteGlossaryAction,
  saveFaqAction,
  saveGlossaryAction,
  type ContentState,
} from "@/lib/contentActions";
import type { FaqItem, GlossaryTerm } from "@/lib/db/content";

/**
 * Help & glossary editing.
 *
 * The Add and Edit buttons on this screen never did anything, because the
 * content was a constant in lib/marketing.ts. It is a table now, and these
 * forms write to it; saving revalidates the public FAQ page, so a change is
 * live immediately.
 *
 * When `editable` is false the database has not had migration 005 applied: the
 * rows shown are the compile-time fallback, and editing them would silently
 * fail, so the controls say so rather than pretending.
 */

export function FaqEditor({
  locale,
  items,
  categories,
  editable,
}: {
  locale: string;
  items: FaqItem[];
  categories: readonly string[];
  editable: boolean;
}) {
  const [editing, setEditing] = useState<FaqItem | "new" | null>(null);
  const [state, action] = useActionState<ContentState, FormData>(saveFaqAction, {});

  // A successful save closes the editor; the list re-renders from the server.
  if (state.ok && editing) setEditing(null);

  return (
    <Card>
      <CardTitle
        action={
          editable ? (
            <Button size="sm" onClick={() => setEditing("new")}>
              <Plus aria-hidden className="size-4" /> Add question
            </Button>
          ) : undefined
        }
      >
        Questions · {items.length}
      </CardTitle>

      {!editable && <MigrationNotice />}

      {editing && (
        <form action={action} className="mb-5 flex flex-col gap-4 rounded-card border border-accent-border bg-accent-soft/30 p-4">
          <input type="hidden" name="locale" value={locale} />
          {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
          <div className="flex items-center justify-between">
            <SectionLabel>{editing === "new" ? "New question" : "Edit question"}</SectionLabel>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Cancel"
              className="text-ink-secondary hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <Field label="Category" htmlFor="faq-cat">
            <Select
              id="faq-cat"
              name="category"
              defaultValue={editing === "new" ? categories[0] : editing.category}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Question" htmlFor="faq-q">
            <Input
              id="faq-q"
              name="question"
              defaultValue={editing === "new" ? "" : editing.question}
              required
            />
          </Field>
          <Field label="Answer" htmlFor="faq-a" hint="Plain language. This is shown to clinicians and the public.">
            <Textarea
              id="faq-a"
              name="answer"
              rows={5}
              defaultValue={editing === "new" ? "" : editing.answer}
              required
            />
          </Field>
          {state.error && <ErrorNote>{state.error}</ErrorNote>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <SubmitButton size="sm" pendingLabel="Saving…">
              Save question
            </SubmitButton>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-5">
        {categories.map((category) => {
          const inCategory = items.filter((f) => f.category === category);
          if (inCategory.length === 0) return null;
          return (
            <div key={category}>
              <SectionLabel className="mb-2">
                {category} · {inCategory.length}
              </SectionLabel>
              <div className="divide-y divide-line rounded-card border border-line">
                {inCategory.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-ink">
                        {f.question}
                        {!f.published && (
                          <Chip size="sm" className="ms-2 bg-subtle text-ink-muted">
                            Hidden
                          </Chip>
                        )}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-secondary">{f.answer}</p>
                    </div>
                    {editable && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(f)}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft"
                        >
                          <Pencil aria-hidden className="size-3.5" />
                          Edit
                        </button>
                        <form action={deleteFaqAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="question" value={f.question} />
                          <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                            Delete
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function GlossaryEditor({
  locale,
  terms,
  editable,
}: {
  locale: string;
  terms: GlossaryTerm[];
  editable: boolean;
}) {
  const [editing, setEditing] = useState<GlossaryTerm | "new" | null>(null);
  const [state, action] = useActionState<ContentState, FormData>(saveGlossaryAction, {});

  if (state.ok && editing) setEditing(null);

  return (
    <Card>
      <CardTitle
        action={
          editable ? (
            <Button variant="secondary" size="sm" onClick={() => setEditing("new")}>
              <Plus aria-hidden className="size-4" /> Add term
            </Button>
          ) : undefined
        }
      >
        Glossary · {terms.length}
      </CardTitle>

      {!editable && <MigrationNotice />}

      {editing && (
        <form action={action} className="mb-5 flex flex-col gap-4 rounded-card border border-accent-border bg-accent-soft/30 p-4">
          <input type="hidden" name="locale" value={locale} />
          {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
          <div className="flex items-center justify-between">
            <SectionLabel>{editing === "new" ? "New term" : "Edit term"}</SectionLabel>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Cancel"
              className="text-ink-secondary hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <Field label="Term" htmlFor="gl-term">
            <Input
              id="gl-term"
              name="term"
              defaultValue={editing === "new" ? "" : editing.term}
              required
            />
          </Field>
          <Field label="Definition" htmlFor="gl-def">
            <Textarea
              id="gl-def"
              name="definition"
              rows={4}
              defaultValue={editing === "new" ? "" : editing.definition}
              required
            />
          </Field>
          {state.error && <ErrorNote>{state.error}</ErrorNote>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <SubmitButton size="sm" pendingLabel="Saving…">
              Save term
            </SubmitButton>
          </div>
        </form>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {terms.map((g) => (
          <div key={g.id} className="rounded-inner border border-line p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-semibold text-ink">{g.term}</p>
              {editable && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${g.term}`}
                    onClick={() => setEditing(g)}
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft"
                  >
                    <Pencil aria-hidden className="size-3.5" />
                  </button>
                  <form action={deleteGlossaryAction}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="term" value={g.term} />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>
            <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-secondary">{g.definition}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MigrationNotice() {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      Editing is unavailable until migration 005 is applied. What you see below is
      the wording currently shipped in the code.
    </p>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
