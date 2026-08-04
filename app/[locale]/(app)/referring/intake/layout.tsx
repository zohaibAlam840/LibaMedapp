import { IntakeProvider } from "@/lib/intakeStore";

// Wraps every intake step in the draft store, so the in-progress referral
// persists across the wizard's routes (and refreshes) until it's submitted.
export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return <IntakeProvider>{children}</IntakeProvider>;
}
