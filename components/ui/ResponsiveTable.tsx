import { cn } from "@/lib/cn";

export interface Column {
  key: string;
  label: string;
  align?: "start" | "end";
}

export interface TableRow {
  /** Stable key for the row. */
  id: string;
  cells: Record<string, React.ReactNode>;
}

/**
 * DataTable (design spec V2 §2.19): sentence-case 12px header on subtle bg,
 * 56px rows, hover fill, hairline dividers, no zebra. On mobile it renders as
 * stacked cards (first column = title row) — never horizontal scroll.
 */
export default function ResponsiveTable({
  columns,
  rows,
  className,
}: {
  columns: Column[];
  rows: TableRow[];
  className?: string;
}) {
  const [first, ...rest] = columns;

  return (
    <div className={className}>
      {/* Desktop table */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="bg-subtle">
            {columns.map((col, i) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold text-ink-secondary",
                  col.align === "end" ? "text-end" : "text-start",
                  i === 0 && "rounded-s-inner",
                  i === columns.length - 1 && "rounded-e-inner",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="h-14 border-b border-line transition-colors last:border-b-0 hover:bg-subtle"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-2 text-sm text-ink",
                    col.align === "end" && "text-end",
                  )}
                >
                  {row.cells[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-card border border-line bg-card p-4">
            <div className="mb-2 text-[15px] font-semibold text-ink">
              {row.cells[first.key]}
            </div>
            <dl className="flex flex-col gap-1.5">
              {rest.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3">
                  <dt className="text-[13px] text-ink-secondary">{col.label}</dt>
                  <dd className="text-end text-sm text-ink">{row.cells[col.key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
