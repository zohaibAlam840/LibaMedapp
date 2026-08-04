import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { Field, Textarea } from "@/components/ui/Field";
import { SectionLabel } from "@/components/ui/Card";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/db/referrals";

// 9D · Request additional information (#46) — without leaving the platform.
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
          Request more information
        </h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Goes straight to the referring clinician&rsquo;s case thread — no email.
        </p>
      </div>

      <Card>
        <CardTitle>What do you need?</CardTitle>
        <SectionLabel className="mb-2">Commonly requested</SectionLabel>
        <div className="mb-5 flex flex-wrap gap-2">
          {["Histopathology report", "Recent bloods", "Prior imaging", "Medication list", "Comorbidity history"].map(
            (t) => (
              <Chip key={t} name="request-items" value={t} multiple>
                {t}
              </Chip>
            ),
          )}
        </div>
        <Field label="Details" htmlFor="details" hint="Be specific — the referrer sees this exactly as written.">
          <Textarea id="details" rows={5} />
        </Field>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" href={`/${locale}/receiving/cases/${c.id}`}>
          Cancel
        </Button>
        <Button>Send request</Button>
      </div>
    </div>
  );
}
