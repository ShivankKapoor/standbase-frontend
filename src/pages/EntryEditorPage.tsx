import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DayTypeBadge } from '../components/entry/DayTypeBadge';
import { getEntry, createEntry, deleteEntry } from '../api/entries';
import type { DayType } from '../types';

export function EntryEditorPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    getEntry(date)
      .then((entry) => {
        setContent(entry.content ?? '');
        setDayType(entry.dayType);
      })
      .catch((err) => {
        if (err.status !== 404) toast.error('Failed to load entry');
      })
      .finally(() => setLoading(false));
  }, [date]);

  async function handleSave() {
    if (!date) return;
    setSaving(true);
    try {
      await createEntry(date, content, dayType);
      toast.success('Entry saved');
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!date) return;
    try {
      await deleteEntry(date);
      toast.success('Entry deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete entry');
    }
  }

  const parsedDate = date ? parseISO(date) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {parsedDate ? format(parsedDate, 'EEEE') : '—'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {parsedDate ? format(parsedDate, 'd MMMM yyyy') : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-96 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Day type</Label>
              <Select value={dayType ?? 'none'} onValueChange={(v) => setDayType(v === 'none' ? null : v as DayType)}>
                <SelectTrigger className="w-40">
                  <SelectValue>
                    {dayType ? <DayTypeBadge dayType={dayType} /> : <span className="text-muted-foreground">None</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="PTO"><DayTypeBadge dayType="PTO" /></SelectItem>
                  <SelectItem value="PLANNING"><DayTypeBadge dayType="PLANNING" /></SelectItem>
                  <SelectItem value="SUPPORT"><DayTypeBadge dayType="SUPPORT" /></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-1 flex-col space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</Label>
              <Textarea
                className="min-h-96 flex-1 resize-none font-mono text-sm"
                placeholder="What did you work on?"
                maxLength={2000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">{content.length}/2000</p>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </main>

      <Toaster richColors position="bottom-center" />
    </div>
  );
}
