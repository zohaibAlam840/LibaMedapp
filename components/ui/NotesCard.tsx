import { Plus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Note {
  date: string;
  text: string;
}

/** Dated notes list (case notes, governance annotations). Design-only stub. */
export default function NotesCard({
  title = "Notes",
  notes,
}: {
  title?: string;
  notes: Note[];
}) {
  return (
    <Card>
      <CardTitle
        action={
          <Button variant="ghost" size="sm">
            <Plus aria-hidden className="size-4" /> Add note
          </Button>
        }
      >
        {title}
      </CardTitle>
      <ul className="flex flex-col gap-3">
        {notes.map((note, i) => (
          <li key={i} className="rounded-inner bg-subtle p-3">
            <p className="text-xs text-ink-muted">{note.date}</p>
            <p className="mt-1 text-sm text-ink">{note.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
