// Intake wizard step definitions (C2C spec §8.1 — pages #30–35 + confirmation).
// One question per screen, autosave between steps (spec §8.4).

export interface IntakeStep {
  id: string;
  /** Path under /[locale]. */
  href: string;
  title: string;
  short: string;
}

export const INTAKE_STEPS: IntakeStep[] = [
  { id: "patient", href: "/referring/intake/patient", title: "Patient details", short: "Patient" },
  { id: "clinical", href: "/referring/intake/clinical", title: "Clinical summary", short: "Clinical" },
  { id: "corridor", href: "/referring/intake/corridor", title: "Destination & specialty", short: "Destination" },
  { id: "declaration", href: "/referring/intake/declaration", title: "NHS non-substitution declaration", short: "Declaration" },
  { id: "documents", href: "/referring/intake/documents", title: "Documents & imaging", short: "Documents" },
  { id: "consent", href: "/referring/intake/consent", title: "Patient consent", short: "Consent" },
  { id: "review", href: "/referring/intake/review", title: "Review & submit", short: "Review" },
];

export function intakeStepIndex(id: string): number {
  return Math.max(0, INTAKE_STEPS.findIndex((s) => s.id === id));
}
