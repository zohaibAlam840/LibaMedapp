import { ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import InviteUserForm from "@/components/admin/InviteUserForm";
import UserAssignmentForm from "@/components/admin/UserAssignmentForm";
import { ROLE_LABEL } from "@/lib/rbac";
import { getUsers } from "@/lib/db/users";
import { getHospitals } from "@/lib/db/hospitals";

// 9E · User & role management (#56). Gated on `canManageUsers` (Vol III §0.4).
// Only referring clinicians self-register; every other role is invited here —
// the invite creates a real account (auth user + profile) and returns a
// one-time password. The list reflects the live profiles table.
const ROLE_TONE: Record<string, string> = {
  referring: "bg-accent-soft text-accent",
  receiving: "bg-warning-bg text-warning-text",
  coordinator: "bg-[#E0E7FF] text-[#4F46E5]",
  caseManager: "bg-[#CCFBF1] text-[#0F766E]",
  admin: "bg-success-bg text-success-text",
};

const TYPE_LABEL: Record<string, string> = {
  introducer: "Introducer",
  patient: "Patient",
};

// A receiving clinician or coordinator with no hospital has an empty queue —
// their scope resolves to nothing — so the gap is called out in the cell
// rather than left as a quiet blank.
function hospitalName(
  u: { accountType: string; role: string | null; hospitalId: string },
  hospitals: { id: string; name: string }[],
) {
  if (u.accountType !== "clinician") return <span className="text-ink-muted">—</span>;
  if (u.role !== "receiving" && u.role !== "coordinator") {
    return <span className="text-ink-muted">Not hospital-scoped</span>;
  }
  const match = hospitals.find((h) => h.id === u.hospitalId);
  if (!match) {
    return <span className="font-medium text-danger-text">Not posted — sees no cases</span>;
  }
  return match.name;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [users, hospitals] = await Promise.all([getUsers(), getHospitals()]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Users &amp; roles</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Invite users and assign roles. Referring clinicians self-register;
            all other roles are invited.
          </p>
        </div>
        <InviteUserForm locale={locale} hospitals={hospitals.map((h) => ({ id: h.id, name: h.name }))} />
      </div>

      <Card>
        <CardTitle>All users · {users.length}</CardTitle>
        {users.length === 0 ? (
          <p className="rounded-inner bg-subtle px-3.5 py-3 text-[13px] text-ink-muted">
            No users yet. Invite your first team member above.
          </p>
        ) : (
          <ResponsiveTable
            columns={[
              { key: "name", label: "User" },
              { key: "role", label: "Role" },
              { key: "org", label: "Organisation" },
              { key: "posting", label: "Hospital" },
              { key: "status", label: "Status" },
              { key: "assign", label: "Role & posting" },
            ]}
            rows={users.map((u) => {
              const roleKey = u.role ?? u.accountType;
              const roleLabel = u.role
                ? ROLE_LABEL[u.role]
                : TYPE_LABEL[u.accountType] ?? u.accountType;
              return {
                id: u.id,
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
                    <Chip size="sm" className={ROLE_TONE[roleKey] ?? "bg-subtle text-ink-secondary"}>
                      {roleLabel}
                    </Chip>
                  ),
                  org: u.org || "—",
                  posting: hospitalName(u, hospitals),
                  assign:
                    u.accountType === "clinician" ? (
                      <UserAssignmentForm
                        locale={locale}
                        profileId={u.id}
                        role={u.role}
                        hospitalId={u.hospitalId}
                        hospitals={hospitals.map((h) => ({ id: h.id, name: h.name }))}
                      />
                    ) : (
                      <span className="text-[13px] text-ink-muted">—</span>
                    ),
                  status:
                    u.status === "verified" ? (
                      <span className="inline-flex items-center gap-1 text-[13px] text-success-text">
                        <ShieldCheck aria-hidden className="size-3.5" /> Verified
                      </span>
                    ) : u.status === "pending" ? (
                      <span className="text-[13px] text-warning-text">Pending review</span>
                    ) : (
                      <span className="text-[13px] text-danger-text">Declined</span>
                    ),
                },
              };
            })}
          />
        )}
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
