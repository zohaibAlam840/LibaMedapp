"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CorridorId } from "@/lib/corridors";

// Client-side intake draft. The wizard spans several routes, so the in-progress
// referral lives here and is mirrored to localStorage (spec §8.4 autosave) — a
// refresh or step-back keeps everything. The Review step reads this and hands it
// to createReferralAction; on success we clear() the draft.

export interface IntakeData {
  // Patient
  firstName: string;
  lastName: string;
  dob: string;
  nhs: string;
  email: string;
  sex: string;
  // Clinical
  summary: string;
  urgency: "routine" | "soon" | "urgent";
  history: string;
  // Destination
  corridorId: CorridorId;
  specialty: string;
  // NHS non-substitution
  nsReason: string;
  nsJustification: string;
  // Documents (staged client-side; real bytes upload on submit — see action)
  documents: { name: string; type: string; size: string }[];
  // Consent — ids of the items the patient agreed to
  consentAgreed: string[];
}

const EMPTY: IntakeData = {
  firstName: "",
  lastName: "",
  dob: "",
  nhs: "",
  email: "",
  sex: "",
  summary: "",
  urgency: "routine",
  history: "",
  corridorId: "israel",
  specialty: "",
  nsReason: "",
  nsJustification: "",
  documents: [],
  consentAgreed: [],
};

const STORAGE_KEY = "libamed:intake:v1";

interface IntakeContextValue {
  data: IntakeData;
  set: (patch: Partial<IntakeData>) => void;
  clear: () => void;
  hydrated: boolean;
}

const IntakeContext = createContext<IntakeContextValue | null>(null);

export function IntakeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<IntakeData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  // Load once on mount (client only — avoids SSR/hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData({ ...EMPTY, ...(JSON.parse(raw) as Partial<IntakeData>) });
    } catch {
      /* ignore corrupt draft */
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  // Persist on every change (after the initial load).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [data]);

  const set = useCallback((patch: Partial<IntakeData>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  const clear = useCallback(() => {
    setData(EMPTY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <IntakeContext.Provider value={{ data, set, clear, hydrated }}>
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntake(): IntakeContextValue {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used within <IntakeProvider>");
  return ctx;
}
