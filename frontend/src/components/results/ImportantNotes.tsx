import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ImportantNotesProps {
  notes: string[];
}

const ImportantNotes = ({ notes }: ImportantNotesProps) => {
  if (notes.length === 0) return null;

  return (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Important Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notes.map((note, index) => (
          <div 
            key={index}
            className="p-2 rounded-lg bg-amber-50 border border-amber-100"
          >
            <p className="text-sm text-amber-900">{note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ImportantNotes;