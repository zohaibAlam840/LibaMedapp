import { CheckCircle2, ScrollText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getDemoCase } from "@/lib/demo";

// 9C · Consent view + withdrawal flow (#40) — acceptance §14.7.
// Withdrawal triggers the stop-processing workflow and is logged immutably.
const CONSENT_ITEMS = [
  "Sharing records with the named receiving specialist",
  "Transfer of records to Israel (EU-adequate destination)",
  "Data categories: referral letter, labs, imaging incl. DICOM",
  "Purpose limited to this referral",
  "Right to withdraw at any time",
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { caseId } = await params;
  const c = getDemoCase(caseId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Consent record</h1>
      </div>

      <Card>
        <CardTitle className="mb-2">Active consent · wording v2</CardTitle>
        <p className="mb-4 flex items-center gap-2 text-[13px] text-ink-secondary">
          <ScrollText aria-hidden className="size-4" />
          Captured 12 Jul 2026, 09:41 · recorded by Dr. Amara Chen · immutable
        </p>
        <ul className="divide-y divide-line rounded-card border border-line px-4">
          {CONSENT_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-3 py-3">
              <CheckCircle2 aria-hidden className="size-5 shrink-0 text-success-text" />
              <span className="text-[15px] text-ink">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">
          The exact wording shown to the patient is stored with this record and
          can be exported for audit.
        </p>
      </Card>

      <Card className="border border-danger-bg">
        <CardTitle className="mb-1">Withdraw consent</CardTitle>
        <p className="text-sm text-ink-secondary">
          If your patient withdraws, all further processing stops immediately:
          the receiving team loses access, and the withdrawal is logged with
          time and reason. This cannot be undone from the platform.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="danger" size="sm">
            Start withdrawal
          </Button>
        </div>
      </Card>
    </div>
  );
}
