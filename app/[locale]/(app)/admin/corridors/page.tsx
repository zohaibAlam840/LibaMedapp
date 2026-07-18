import { Globe2, Lock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import { CorridorBadge } from "@/components/ui/Badges";

// 9E · Corridor configuration (#55). Corridor = first-class config object
// (C2C §4/§10). Read-mostly; edits are audited + flagged. Turkish 5-day rule
// surfaced. Editing gated on the admin `canEditCorridors` flag (Vol III §0.4).
const CORRIDORS = [
  {
    code: "IL", label: "UK → Israel", hosting: "UK region (no mandatory localisation)",
    mechanism: "EU-adequate destination; UK IDTA/TRA as good practice",
    consent: "v2 (EN/HE)", retention: "10 years (strictest of both)", notify: "None",
  },
  {
    code: "FR", label: "UK → France", hosting: "EEA · HDS-certified (mandatory)", residency: "EEA · HDS",
    mechanism: "Direct EU transfer under UK adequacy; CNIL rules apply",
    consent: "v2 (EN/FR)", retention: "20 years (French health records)", notify: "72h breach (CNIL)",
  },
  {
    code: "TR", label: "UK → Turkey", hosting: "UK region (no mandatory localisation)",
    mechanism: "KVKK-approved SCC (Turkish text prevails)",
    consent: "v2 (EN/TR)", retention: "10 years", notify: "KVKK — within 5 business days of SCC signature",
  },
  {
    code: "CH", label: "UK → Switzerland", hosting: "UK region (no mandatory localisation)",
    mechanism: "Swiss Federal Council adequacy — no SCCs required",
    consent: "v2 (EN/DE/FR)", retention: "10 years", notify: "None",
  },
];

export default async function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Corridor configuration</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Residency, transfer mechanism, consent wording, retention, and
            regulatory notifications — per corridor.
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Globe2 aria-hidden className="size-4" /> Add corridor
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {CORRIDORS.map((c) => (
          <Card key={c.code}>
            <CardTitle
              action={
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              }
            >
              <span className="flex items-center gap-2">
                <CorridorBadge code={c.code} label={c.label} residency={c.residency} />
              </span>
            </CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow icon={Lock} label="Hosting region" value={c.hosting} />
              <DetailPanelRow icon={Globe2} label="Transfer mechanism" value={c.mechanism} />
              <DetailPanelRow icon={Globe2} label="Consent wording" value={c.consent} />
              <DetailPanelRow icon={Globe2} label="Retention" value={c.retention} />
              <DetailPanelRow
                icon={Globe2}
                label="Regulatory notification"
                value={
                  c.notify.includes("5 business days") ? (
                    <span className="text-warning-text">{c.notify}</span>
                  ) : (
                    c.notify
                  )
                }
              />
            </div>
            <div className="mt-3 border-t border-line pt-2">
              <Toggle label="Active — accepts new referrals" defaultChecked />
            </div>
          </Card>
        ))}
      </div>

      <p className="rounded-inner bg-subtle px-4 py-3 text-[13px] text-ink-secondary">
        Every change here is written to the audit log and flagged for review.
        Consent wording and transfer templates are legally supplied — the
        platform stores and versions them.
      </p>
    </div>
  );
}
