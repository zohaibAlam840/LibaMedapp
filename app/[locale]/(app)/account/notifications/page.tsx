import { Card, CardTitle } from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

// 9B · Notification preferences. Notifications themselves are V1.5 (§8.5) —
// this page is the preferences shell (email channel only for now).
export default async function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-[28px] font-semibold text-ink">Notification preferences</h1>
      <p className="mb-6 text-[15px] text-ink-secondary">
        Email alerts about your cases. In-app and SMS channels arrive later.
      </p>

      <Card>
        <CardTitle>Case activity</CardTitle>
        <div className="divide-y divide-line">
          <Toggle label="New case assigned to you" defaultChecked />
          <Toggle label="Hospital response received" defaultChecked />
          <Toggle label="Unread secure message" defaultChecked />
          <Toggle
            label="Response overdue against SLA"
            description="When a receiving team hasn't responded in the expected window"
            defaultChecked
          />
        </div>
      </Card>

      <Card className="mt-4">
        <CardTitle>Consent &amp; access</CardTitle>
        <div className="divide-y divide-line">
          <Toggle label="Consent nearing expiry" defaultChecked />
          <Toggle
            label="Case access nearing expiry"
            description="Receiving access expires after 90 days of inactivity"
            defaultChecked
          />
        </div>
      </Card>
    </div>
  );
}
