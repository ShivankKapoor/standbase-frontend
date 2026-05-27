import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { DayTypeBadge } from './DayTypeBadge';
import { getEntry, createEntry, deleteEntry } from '../../api/entries';
import type { DayType, EntryOverview } from '../../types';

const DAY_TYPES: DayType[] = ['PTO', 'PLANNING', 'SUPPORT'];

const dayTypeRing: Record<DayType, string> = {
  PTO:      'ring-sky-500',
  PLANNING: 'ring-violet-500',
  SUPPORT:  'ring-amber-500',
};

interface EntryPanelProps {
  date: string;
  onClose: () => void;
  onSave: (date: string, dayType: EntryOverview['dayType']) => void;
  onDelete: (date: string) => void;
}

export function EntryPanel({ date, onClose, onSave, onDelete }: EntryPanelProps) {
  const [content, setContent] = useState('');
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEntry(date)
      .then((entry) => {
        setContent(entry.content ?? '');
        setDayType(entry.dayType);
      })
      .catch((err) => {
        if (err.status === 404) {
          setContent('');
          setDayType(null);
        } else {
          toast.error('Failed to load entry');
        }
      })
      .finally(() => setLoading(false));
  }, [date]);

  async function handleSave() {
    setSaving(true);
    try {
      await createEntry(date, content, dayType);
      onSave(date, dayType);
      toast.success('Entry saved');
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteEntry(date);
      onDelete(date);
      onClose();
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  }

  return (
    <div className="flex h-full flex-col bg-card animate-fade-in">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {format(parseISO(date), 'EEEE')}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(parseISO(date), 'd MMMM yyyy')}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-40 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Day type</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDayType(null)}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    dayType === null
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/50',
                  ].join(' ')}
                >
                  None
                </button>
                {DAY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setDayType(t === dayType ? null : t)}
                    className={[
                      'rounded-full transition-all ring-offset-background',
                      dayType === t ? `ring-2 ring-offset-1 ${dayTypeRing[t]}` : '',
                    ].join(' ')}
                  >
                    <DayTypeBadge dayType={t} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</Label>
              <Textarea
                className="flex-1 resize-none font-mono text-sm min-h-48"
                placeholder="What did you work on?"
                maxLength={2000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">{content.length}/2000</p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
