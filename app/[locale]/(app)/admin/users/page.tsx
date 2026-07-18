import { Plus, ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { ROLE_LABEL } from "@/lib/rbac";

// 9E · User & role management (#56). Gated on `canManageUsers` (Vol III §0.4).
// Only referring clinicians self-register; every other role is invited here.
const USERS = [
  { name: "Dr. Amara Chen", email: "a.chen@nhs.net", role: "referring", org: "Riverside Medical Practice", mfa: true, verified: true, last: "2h ago" },
  { name: "Dr. Noa Peretz", email: "n.peretz@sheba.health.il", role: "receiving", org: "Sheba Medical Center", mfa: true, verified: true, last: "1d ago" },
  { name: "Yael Adler", email: "y.adler@sheba.health.il", role: "coordinator", org: "Sheba Medical Center", mfa: true, verified: true, last: "3h ago" },
  { name: "Jordan Ellis", email: "j.ellis@libamed.co.uk", role: "caseManager", org: "LibaMed", mfa: true, verified: true, last: "20m ago" },
  { name: "Sam Okafor", email: "s.okafor@libamed.co.uk", role: "admin", org: "LibaMed", mfa: true, verified: true, last: "Active now" },
  { name: "Dr. Claire Moreau", email: "c.moreau@hopital-foch.fr", role: "receiving", org: "Hôpital Foch", mfa: false, verified: true, last: "5d ago" },
] as const;

const ROLE_TONE: Record<string, string> = {
  referring: "bg-accent-soft text-accent",
  receiving: "bg-warning-bg text-warning-text",
  coordinator: "bg-[#E0E7FF] text-[#4F46E5]",
  caseManager: "bg-[#CCFBF1] text-[#0F766E]",
  admin: "bg-success-bg text-success-text",
};

export default async function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Users &amp; roles</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Invite users and assign roles. Referring clinicians self-register;
            all other roles are invited.
          </p>
        </div>
        <Button>
          <Plus aria-hidden className="size-4" /> Invite user
        </Button>
      </div>

      <Card>
        <CardTitle>All users</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "name", label: "User" },
            { key: "role", label: "Role" },
            { key: "org", label: "Organisation" },
            { key: "mfa", label: "MFA" },
            { key: "last", label: "Last active" },
            { key: "actions", label: "" },
          ]}
          rows={USERS.map((u) => ({
            id: u.email,
            cells: {
              name: (
                <span className="flex items-center gap-2.5 font-medium">
                  <Avatar name={u.name} size="sm" />
                  <span>
                    {u.name}
                    <span className="block text-xs font-normal text-ink-muted">{u.email}</span>
                  </span>
                </span>
              ),
              role: (
                <Chip size="sm" className={ROLE_TONE[u.role]}>
                  {ROLE_LABEL[u.role]}
                </Chip>
              ),
              org: u.org,
              mfa: u.mfa ? (
                <span className="inline-flex items-center gap-1 text-[13px] text-success-text">
                  <ShieldCheck aria-hidden className="size-3.5" /> On
                </span>
              ) : (
                <span className="text-[13px] text-danger-text">Not enrolled</span>
              ),
              last: u.last,
              actions: (
                <button className="text-[13px] font-medium text-accent hover:underline">
                  Edit
                </button>
              ),
            },
          }))}
        />
      </Card>

      <Card>
        <CardTitle>What each role can see</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "role", label: "Role" },
            { key: "sees", label: "Access summary" },
          ]}
          rows={[
            { id: "ref", cells: { role: "Referring clinician", sees: "Own cases only — create, consent, message, receive plans + summaries" } },
            { id: "rcv", cells: { role: "Receiving clinician", sees: "Own named queue at their hospital; documents + DICOM; responses" } },
            { id: "crd", cells: { role: "Hospital coordinator", sees: "Hospital-wide status/logistics — no clinical detail" } },
            { id: "mgr", cells: { role: "Case manager", sees: "All cases' status/routing/consent/residency; message metadata only" } },
            { id: "adm", cells: { role: "Compliance / admin", sees: "Everything + audit, consent records, retention/DSAR, configuration" } },
          ]}
        />
      </Card>
    </div>
  );
}
