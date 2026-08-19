"use client";

import { useState } from "react";
import SubmitButton from "@/components/ui/SubmitButton";
import { Select } from "@/components/ui/Field";
import { updateUserAssignmentAction } from "@/lib/adminActions";
import type { Role } from "@/lib/rbac";

const ROLES: { value: Role; label: string }[] = [
  { value: "referring", label: "Referring clinician" },
  { value: "receiving", label: "Receiving clinician" },
  { value: "coordinator", label: "Hospital coordinator" },
  { value: "caseManager", label: "Case manager" },
  { value: "admin", label: "Compliance / admin" },
];

/** Roles whose case queue is scoped by a hospital. */
const NEEDS_HOSPITAL = new Set<string>(["receiving", "coordinator"]);

/**
 * Change one clinician's role and hospital posting.
 *
 * This is the control that decides who can see an incoming referral: a
 * receiving clinician's queue is filtered to their own hospital, so an account
 * with none sees an empty queue however many cases exist, and a hospital with
 * no account attached swallows every referral sent to it.
 */
export default function UserAssignmentForm({
  locale,
  profileId,
  role,
  hospitalId,
  hospitals,
}: {
  locale: string;
  profileId: string;
  role: Role | null;
  hospitalId: string;
  hospitals: { id: string; name: string }[];
}) {
  const [selectedRole, setSelectedRole] = useState<string>(role ?? "referring");

  return (
    <form action={updateUserAssignmentAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="locale" value={locale} />
      <div className="w-44">
        <Select
          aria-label="Role"
          name="role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="h-10"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>
      {NEEDS_HOSPITAL.has(selectedRole) && (
        <div className="w-52">
          <Select
            aria-label="Hospital"
            name="hospitalId"
            defaultValue={hospitalId}
            className="h-10"
          >
            <option value="">No hospital — sees nothing</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <SubmitButton variant="secondary" size="sm" pendingLabel="Saving…">
        Save
      </SubmitButton>
    </form>
  );
}
