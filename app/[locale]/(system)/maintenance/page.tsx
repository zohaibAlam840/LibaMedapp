import { Wrench } from "lucide-react";
import SystemState from "@/components/SystemState";

// 9F · Maintenance — scheduled outside clinic hours (07:00–19:00 UK/EU/ME).
export default async function Page() {
  return (
    <SystemState
      icon={Wrench}
      title="Scheduled maintenance"
      description="LibaMed is briefly offline for planned maintenance. Your cases and data are safe — please check back shortly."
    />
  );
}
