export interface ConsentItem {
  title: string;
  body: string;
  /** e.g. "Version 2.1 · shown 18 Jul 2026" */
  version: string;
  defaultChecked?: boolean;
}

/**
 * ConsentChecklist (design spec V2 §2.17): each item is an inset card with its
 * own checkbox, title, plain-language body, and a version/shown line. Items
 * are individually checkable — never one master checkbox. The capture layer
 * stores the exact wording + timestamp per item (C2C §7.3).
 */
export default function ConsentChecklist({ items }: { items: ConsentItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.title}>
          <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-card p-4 transition-colors hover:border-line-strong has-[:checked]:border-accent-border has-[:checked]:bg-accent-soft/50">
            <input
              type="checkbox"
              defaultChecked={item.defaultChecked}
              className="mt-0.5 size-5 shrink-0 rounded"
            />
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">
                {item.title}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-ink-secondary">
                {item.body}
              </span>
              <span className="mt-1.5 block text-xs text-ink-muted">
                {item.version}
              </span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
