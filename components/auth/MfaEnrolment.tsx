"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * TOTP enrolment. Runs in the browser because the authenticator secret must
 * never round-trip through our server logs — Supabase issues it directly to the
 * client, we only ever see the 6-digit code the user types back.
 *
 * Flow: enroll → show QR → user scans → verify a code → factor becomes active.
 */
export default function MfaEnrolment({ locale }: { locale: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [existing, setExisting] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Is a verified factor already enrolled?
  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.[0];
      if (totp) setExisting({ id: totp.id, status: totp.status });
    });
  }, [supabase]);

  async function startEnrolment() {
    setError(null);
    setBusy(true);
    // Clear any half-finished factor first, or Supabase rejects a second enrol.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.totp ?? []) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `LibaMed ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  }

  async function verify() {
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
      setError("That code wasn't accepted. Check your authenticator app and try again.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  async function turnOff() {
    if (!existing) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId: existing.id });
    setBusy(false);
    setExisting(null);
    setDone(false);
    router.refresh();
  }

  if (done || existing?.status === "verified") {
    return (
      <Card>
        <CardTitle className="mb-2 flex items-center gap-2">
          <CheckCircle2 aria-hidden className="size-5 text-success-text" />
          Two-factor authentication is on
        </CardTitle>
        <p className="text-[15px] text-ink-secondary">
          You&rsquo;ll be asked for a 6-digit code from your authenticator app
          each time you sign in on a new device.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={turnOff} loading={busy}>
            Turn off
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-2 flex items-center gap-2">
        <ShieldCheck aria-hidden className="size-5 text-accent" />
        Set up two-factor authentication
      </CardTitle>
      <p className="text-[15px] text-ink-secondary">
        Protects patient data if your password is ever compromised. You&rsquo;ll
        need an authenticator app such as Google Authenticator, Microsoft
        Authenticator, or 1Password.
      </p>

      {!qr ? (
        <div className="mt-4 flex justify-end">
          <Button onClick={startEnrolment} loading={busy} disabled={busy}>
            Begin setup
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 rounded-inner border border-line bg-card p-5">
            {/* Supabase returns the QR as an SVG data URI. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code for your authenticator app" className="size-48" />
            <p className="text-center text-[13px] text-ink-secondary">
              Scan this with your authenticator app.
            </p>
            {secret && (
              <p className="text-center text-[12px] text-ink-muted">
                Can&rsquo;t scan? Enter this key manually:
                <br />
                <code className="font-mono text-[12px] text-ink">{secret}</code>
              </p>
            )}
          </div>

          <Field label="Enter the 6-digit code" htmlFor="mfa-code">
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </Field>

          {error && (
            <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" href={`/${locale}/account`}>
              Cancel
            </Button>
            <Button size="sm" onClick={verify} loading={busy} disabled={code.length !== 6 || busy}>
              Turn on two-factor
            </Button>
          </div>
        </div>
      )}

      {error && !qr && (
        <p className="mt-3 flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </Card>
  );
}
