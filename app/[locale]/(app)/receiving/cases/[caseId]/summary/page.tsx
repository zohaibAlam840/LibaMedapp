import { Timer } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/db/referrals";

// 9D · Submit clinical summary (#48) — acceptance §14.8.
// Structured handback to the UK referrer within 5 working days (Pledge).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
          Clinical summary handback
        </h1>
      </div>

      <p className="flex items-center gap-2.5 rounded-inner bg-warning-bg px-4 py-3 text-[13px] text-warning-text">
        <Timer aria-hidden className="size-4 shrink-0" />
        Due within 5 working days of treatment completion — 3 days remaining on
        this case.
      </p>

      <Card>
        <CardTitle>Summary for the UK referrer</CardTitle>
        <div className="flex flex-col gap-4">
          <Field label="Treatment performed" htmlFor="s-treatment">
            <Textarea id="s-treatment" rows={5} />
          </Field>
          <Field label="Follow-up required" htmlFor="s-followup" hint="What UK care needs to do, and when.">
            <Textarea id="s-followup" rows={3} />
          </Field>
          <Field label="Medication changes" htmlFor="s-meds">
            <Textarea id="s-meds" rows={3} />
          </Field>
          <Field label="Fitness / restrictions" htmlFor="s-fitness">
            <Input id="s-fitness" placeholder="e.g. no flying for 4 weeks" />
          </Field>
        </div>
        <div className="mt-4">
          <Button variant="secondary" size="sm">
            Attach discharge summary (PDF)
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" href={`/${locale}/receiving/cases/${c.id}`}>
          Save draft
        </Button>
        <Button>Return to referrer</Button>
      </div>
    </div>
  );
}
