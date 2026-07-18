import { Building2, Clock3, Flag } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="c-name">
              <Input id="c-name" autoComplete="name" />
            </Field>
            <Field label="Email" htmlFor="c-email">
              <Input id="c-email" type="email" autoComplete="email" />
            </Field>
            <Field label="Role" htmlFor="c-role">
              <Select id="c-role" defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                <option>Clinician</option>
                <option>Hospital / provider</option>
                <option>Press</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Organisation" htmlFor="c-org">
              <Input id="c-org" autoComplete="organization" />
            </Field>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Subject" htmlFor="c-subject">
              <Select id="c-subject" defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                <option>Partnership enquiry</option>
                <option>Registering as a clinician</option>
                <option>Data protection question</option>
                <option>Something else</option>
              </Select>
            </Field>
            <Field
              label="Message"
              htmlFor="c-message"
              hint="No clinical details or patient-identifying information, please."
            >
              <Textarea id="c-message" rows={6} />
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button>Send message</Button>
          </div>
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
