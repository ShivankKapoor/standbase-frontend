import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { X, Trash2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DayTypeBadge } from './DayTypeBadge';
import { TodoList } from './TodoList';
import { getEntry, createEntry, deleteEntry } from '../../api/entries';
import { useTodos } from '../../hooks/useTodos';
import type { DayType, EntryOverview, Todo } from '../../types';

const STANDUP_TEMPLATE = `📆 What you did yesterday\n👉 What you are doing today\n🛑 Blockers preventing you from making progress`;

interface EntryPanelProps {
  date: string;
  onClose: () => void;
  onSave: (date: string, dayType: EntryOverview['dayType']) => void;
  onDelete: (date: string) => void;
  onTodosChange: (date: string, todos: Todo[]) => void;
}

export function EntryPanel({ date, onClose, onSave, onDelete, onTodosChange }: EntryPanelProps) {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [savedContent, setSavedContent] = useState('');
  const [savedDayType, setSavedDayType] = useState<DayType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { todos, loading: todosLoading, fetched: todosFetched, addTodo, toggleTodo, removeTodo, reorderTodo, editTodo } = useTodos(date);

  useEffect(() => {
    if (todosFetched) onTodosChange(date, todos);
  }, [todos, todosFetched]);

  const isDirty = content !== savedContent || dayType !== savedDayType;

  function guardUnsaved(action: () => void) {
    if (isDirty) {
      setPendingAction(() => action);
      setShowDiscard(true);
    } else {
      action();
    }
  }

  useEffect(() => {
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
        if (err.status === 404) {
          setContent('');
          setDayType(null);
          setSavedContent('');
          setSavedDayType(null);
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
      setSavedContent(content);
      setSavedDayType(dayType);
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
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/entry/${date}`, { state: { draft: { content, dayType }, saved: { content: savedContent, dayType: savedDayType } } })} aria-label="Open full editor">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => guardUnsaved(onClose)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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

            <div className="space-y-2">
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
                className="resize-none text-sm min-h-48" style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                placeholder="What did you work on?"
                maxLength={2000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">{content.length}/2000</p>
            </div>

            <TodoList
              todos={todos}
              loading={todosLoading}
              onAdd={addTodo}
              onToggle={toggleTodo}
              onRemove={removeTodo}
              onEdit={editTodo}
              onReorder={reorderTodo}
              onExpand={() => navigate(`/todos/${date}`)}
            />
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={loading || savedContent === '' && savedDayType === null}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || loading}
          className={isDirty ? 'bg-[#FF6319] hover:bg-[#FF6319]/90 text-white' : ''}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
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
              onClick={() => { pendingAction?.(); setShowDiscard(false); }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
