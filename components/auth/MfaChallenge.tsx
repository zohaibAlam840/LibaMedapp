"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Second-factor prompt at sign-in. Verifying raises the session's assurance
 * level (aal1 → aal2), which is what the app checks before letting a
 * two-factor account reach patient data.
 */
export default function MfaChallenge({ locale, next }: { locale: string; next: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find((f) => f.status === "verified");
      if (verified) setFactorId(verified.id);
      else router.replace(next); // nothing to challenge — carry on
    });
  }, [supabase, router, next]);

  async function submit() {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) {
      setBusy(false);
      setError(cErr.message);
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setBusy(false);
    if (vErr) {
      setError("That code wasn't accepted. Codes change every 30 seconds — try the current one.");
      setCode("");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2.5 rounded-inner bg-accent-soft p-3.5 text-[13px] text-ink">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
        Open your authenticator app and enter the current 6-digit code for LibaMed.
      </p>

      <Field label="Authentication code" htmlFor="mfa-challenge">
        <Input
          id="mfa-challenge"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.length === 6) submit();
          }}
          placeholder="000000"
        />
      </Field>

      {error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <Button onClick={submit} loading={busy} disabled={code.length !== 6 || busy} className="w-full">
        Verify and continue
      </Button>

      <p className="text-center text-[13px] text-ink-muted">
        Lost your device? Contact your administrator — they can reset your
        second factor after identity checks.
      </p>
    </div>
  );
}
