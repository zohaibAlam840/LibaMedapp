import "server-only";
import { Resend } from "resend";

// Transactional email. Every send is best-effort: a failure is logged and
// swallowed, never thrown. Losing a notification must not roll back the
// clinical action that triggered it — an approved doctor stays approved even if
// the "you're approved" email bounces.
//
// Without RESEND_API_KEY the whole module no-ops, so the app runs unchanged on
// a machine with no mail credentials.

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "LibaMed <onboarding@resend.dev>";

export function emailConfigured(): boolean {
  return Boolean(KEY);
}

/** Absolute base URL for links inside emails. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

interface SendArgs {
  to: string;
  subject: string;
  /** Plain-text body. Rendered into a simple branded HTML shell. */
  body: string;
  /** Optional call-to-action button. */
  action?: { label: string; url: string };
  /** Small print under the button. */
  footnote?: string;
}

function shell({ subject, body, action, footnote }: Omit<SendArgs, "to">): string {
  const paragraphs = body
    .trim()
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334">${p
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  const button = action
    ? `<p style="margin:24px 0"><a href="${action.url}" style="display:inline-block;background:#3b82d6;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;font-weight:600">${action.label}</a></p>
       <p style="margin:0 0 16px;font-size:12px;color:#8b93a8;word-break:break-all">If the button doesn't work, paste this into your browser:<br>${action.url}</p>`
    : "";

  const foot = footnote
    ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f2;font-size:12px;line-height:1.6;color:#8b93a8">${footnote}</p>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:#f6f8fb;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f2;border-radius:12px;padding:32px">
    <div style="margin-bottom:24px;font-size:17px;font-weight:700;color:#182238">
      <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:#3b82d6;color:#fff;border-radius:50%;font-size:12px;margin-right:8px">LM</span>LibaMed
    </div>
    <h1 style="margin:0 0 18px;font-size:20px;line-height:1.3;color:#141b2a">${subject}</h1>
    ${paragraphs}${button}${foot}
  </div>
  <p style="max-width:560px;margin:16px auto 0;font-size:11px;color:#8b93a8;text-align:center">
    LibaMed — clinician-to-clinician referrals. This message may contain confidential information.
  </p>
</body></html>`;
}

/** Send an email. Returns false on failure; never throws. */
export async function sendEmail(args: SendArgs): Promise<boolean> {
  if (!KEY) {
    console.warn(`[email] skipped (no RESEND_API_KEY): "${args.subject}" → ${args.to}`);
    return false;
  }
  try {
    const resend = new Resend(KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: shell(args),
      text: args.body + (args.action ? `\n\n${args.action.label}: ${args.action.url}` : ""),
    });
    if (error) {
      console.warn("[email] send failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[email] send threw:", (e as Error)?.message);
    return false;
  }
}
