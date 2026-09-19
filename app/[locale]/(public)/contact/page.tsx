import { Building2, Clock3, Flag } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ContactForm from "@/components/marketing/ContactForm";

// 9A · Contact (spec V2 page 8): form card + info column. Explicitly not a
// channel for clinical or patient information.
export default async function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-ink">Contact us</h1>
        <p className="mt-2 text-[15px] text-ink-secondary">
          For partnership, press, and general enquiries. Please don&rsquo;t send
          clinical or patient information through this form.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-6">
          <CardTitle>Send a message</CardTitle>
          <ContactForm />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Building2 aria-hidden className="size-4.5" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-ink">LibaMed Ltd</p>
                <p className="mt-1 leading-relaxed text-ink-secondary">
                  Registered in Cardiff, Wales
                  <br />
                  Company no. 17272473
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Clock3 aria-hidden className="size-4.5" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-ink">Response times</p>
                <p className="mt-1 leading-relaxed text-ink-secondary">
                  General enquiries: within two working days. Registration
                  issues: within one working day.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning-text">
                <Flag aria-hidden className="size-4.5" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-ink">Clinical concerns</p>
                <p className="mt-1 leading-relaxed text-ink-secondary">
                  Concerns about care on an active case route to clinical
                  governance — use the flag action inside the platform so
                  they&rsquo;re logged and tracked.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
