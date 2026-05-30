"use client";

const quickReplies = [
  "Salut! Este disponibil?",
  "Acceptați schimb?",
  "Se poate livra?",
  "Care este ultimul preț?",
  "Pot veni să îl văd?",
];

export function QuickReplies({
  onSelect,
}: {
  onSelect: (reply: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {quickReplies.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onSelect(reply)}
          className="shrink-0 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
