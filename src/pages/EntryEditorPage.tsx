import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { DayTypeBadge } from '../components/entry/DayTypeBadge';
import { getEntry, createEntry, deleteEntry } from '../api/entries';
import type { DayType } from '../types';

const STANDUP_TEMPLATE = `📆 What you did yesterday\n👉 What you are doing today\n🛑 Blockers preventing you from making progress`;

export function EntryEditorPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const draft = state?.draft as { content: string; dayType: DayType | null } | undefined;
  const saved = state?.saved as { content: string; dayType: DayType | null } | undefined;

  const [content, setContent] = useState(draft?.content ?? '');
  const [dayType, setDayType] = useState<DayType | null>(draft?.dayType ?? null);
  const [savedContent, setSavedContent] = useState(saved?.content ?? draft?.content ?? '');
  const [savedDayType, setSavedDayType] = useState<DayType | null>(saved?.dayType ?? draft?.dayType ?? null);
  const [loading, setLoading] = useState(!draft);
  const [saving, setSaving] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);

  const isDirty = content !== savedContent || dayType !== savedDayType;

  useEffect(() => {
    if (!date || draft) return;
    setLoading(true);
    getEntry(date)
      .then((entry) => {
        const c = entry.content ?? '';
        const d = entry.dayType;
        setContent(c);
        setDayType(d);
        setSavedContent(c);
        setSavedDayType(d);
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
      setSavedContent(content);
      setSavedDayType(dayType);
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
          <Button variant="ghost" size="icon" onClick={() => isDirty ? setShowDiscard(true) : navigate('/')}>
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
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                  {isDirty && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF6319]" />
                      <span className="text-xs italic normal-case tracking-normal text-[#FF6319]">Unsaved</span>
                    </>
                  )}
                </Label>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => content.trim() ? setShowTemplateConfirm(true) : setContent(STANDUP_TEMPLATE)}>
                  Apply Template
                </Button>
              </div>
              <Textarea
                className="min-h-96 flex-1 resize-none text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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
                disabled={savedContent === '' && savedDayType === null}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className={isDirty ? 'bg-[#FF6319] hover:bg-[#FF6319]/90 text-white' : ''}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </main>

      <Toaster richColors position="bottom-center" />

      <AlertDialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite your existing notes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { setContent(STANDUP_TEMPLATE); setShowTemplateConfirm(false); }}
            >
              Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => navigate('/')}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
