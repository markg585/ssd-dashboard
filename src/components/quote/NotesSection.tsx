// components/quote/NotesSection.tsx

type Props = {
    notes: string;
  };
  
  export default function NotesSection({ notes }: Props) {
    if (!notes || notes.trim() === "") return null;
  
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Notes</h3>
        <div className="rounded-md border bg-muted p-3 text-sm text-muted-foreground whitespace-pre-wrap">
          {notes}
        </div>
      </div>
    );
  }
  