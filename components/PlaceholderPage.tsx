import { Hammer } from "lucide-react";
import { Card, SectionLabel } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { getRoute, ROLE_LABELS, TIER_LABELS, GROUP_LABELS } from "@/lib/routes";

/**
 * Shared placeholder rendered by every not-yet-designed V1 page. Reads the
 * page's metadata from the route manifest (lib/routes.ts) so the skeleton is
 * self-documenting: name, group, RBAC roles, tier, mapped acceptance tests.
 *
 * TODO: design + build — replace each page's real UI as designs are composed.
 */
export default function PlaceholderPage({ routeId }: { routeId: string }) {
  const route = getRoute(routeId);

  if (!route) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="rounded-inner bg-danger-bg p-4 text-sm text-danger-text">
          Unknown routeId <code>{routeId}</code> — not found in lib/routes.ts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <SectionLabel>
        {GROUP_LABELS[route.group]} · Section {route.section}
      </SectionLabel>
      <h1 className="mt-1 text-[28px] font-semibold text-ink">{route.title}</h1>

      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3.5 py-1.5 text-[13px] font-medium text-warning-text">
        <Hammer aria-hidden className="size-3.5" />
        TODO: design + build
      </span>

      {route.note && (
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{route.note}</p>
      )}

      <Card className="mt-6 p-0">
        <dl className="divide-y divide-line">
          <Meta label="Route">
            <code className="text-[13px]">/[locale]{route.path === "/" ? "" : route.path}</code>
          </Meta>
          <Meta label="Scope tier">{TIER_LABELS[route.tier]}</Meta>
          <Meta label="Allowed roles">
            <span className="flex flex-wrap gap-1.5">
              {route.roles.map((r) => (
                <Chip key={r} size="sm">
                  {ROLE_LABELS[r]}
                </Chip>
              ))}
            </span>
          </Meta>
          <Meta label="Acceptance tests (§14)">
            {route.tests?.length ? route.tests.map((t) => `#${t}`).join(", ") : "—"}
          </Meta>
        </dl>
      </Card>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
      <dt className="w-40 shrink-0 text-[13px] font-medium text-ink-secondary">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-ink">{children}</dd>
    </div>
  );
}
