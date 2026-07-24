import { ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

// 9A · Specialties directory — placeholder / "coming soon". The full directory
// is intentionally deferred: the specialty list changes per partner hospital,
// so we describe the breadth here and build the searchable directory later.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center md:px-8">
      <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Sparkles aria-hidden className="size-6" />
      </span>
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-ink-secondary">
        Coming soon
      </span>
      <h1 className="text-3xl font-semibold text-ink md:text-4xl">
        Specialties directory
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-secondary">
        Hospitals that partner with LibaMed provide a multitude of specialties and
        medical technologies. We&rsquo;re building a searchable directory that maps
        each one to named specialists at accredited partner hospitals.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={`${base}/for-clinicians`}>
          For clinicians
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Button>
        <Button variant="secondary" href={`${base}/contact`}>
          Ask about a specific case
        </Button>
      </div>
    </div>
  );
}
