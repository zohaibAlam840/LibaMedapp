import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { getDemoCase } from "@/lib/demo";

// 9D · Treatment plan response template (#45) — acceptance §14.5.
// Structured response: plan + itemised cost estimate + timeline (C2C §8.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = getDemoCase(caseId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Treatment plan response</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Sent to the referring clinician as a structured plan. Costs must be
          itemised — no hidden fees is a Pledge commitment.
        </p>
      </div>

      <Card>
        <CardTitle>Plan</CardTitle>
        <div className="flex flex-col gap-4">
          <Field label="Proposed treatment" htmlFor="plan" hint="What you would tell the referring clinician directly.">
            <Textarea id="plan" rows={6} />
          </Field>
          <Field label="Expected inpatient stay" htmlFor="stay">
            <Select id="stay" defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              <option>Day case</option>
              <option>1–3 days</option>
              <option>4–7 days</option>
              <option>Over a week</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle>Costs &amp; timeline</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Estimated total cost" htmlFor="cost" hint="Attach the itemised breakdown below.">
            <Input id="cost" inputMode="decimal" placeholder="£" />
          </Field>
          <Field label="Earliest start" htmlFor="start">
            <Input id="start" type="date" />
          </Field>
        </div>
        <div className="mt-4">
          <Button variant="secondary" size="sm">
            Attach itemised estimate (PDF)
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" href={`/${locale}/receiving/cases/${c.id}`}>
          Save draft
        </Button>
        <Button>Send to referrer</Button>
      </div>
    </div>
  );
}
