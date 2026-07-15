import { useRef, useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { addDays, subDays, format, parseISO } from 'date-fns';
import { Check, GripVertical, Maximize2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import type { Todo } from '../../types';

interface SortableTodoItemProps {
  todo: Todo;
  date?: string;
  onToggle: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onMove?: (id: string, targetDate: string) => void;
  onRequestCustomMove?: (id: string, entryDate: string) => void;
}

function SortableTodoItem({ todo, date, onToggle, onRemove, onEdit, onMove, onRequestCustomMove }: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.content);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditValue(todo.content);
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editing, todo.content]);

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.content) onEdit(todo.id, trimmed);
    setEditing(false);
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  }

  const parsedDate = date ? parseISO(date) : null;
  const prevDate = parsedDate ? format(subDays(parsedDate, 1), 'yyyy-MM-dd') : null;
  const nextDate = parsedDate ? format(addDays(parsedDate, 1), 'yyyy-MM-dd') : null;
  const isFriday = parsedDate?.getDay() === 5;
  const nextMonday = parsedDate && isFriday ? format(addDays(parsedDate, 3), 'yyyy-MM-dd') : null;
  const isMonday = parsedDate?.getDay() === 1;
  const prevFriday = parsedDate && isMonday ? format(subDays(parsedDate, 3), 'yyyy-MM-dd') : null;

  const item = (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="group flex items-center gap-2 rounded px-1 py-1 hover:bg-muted/40"
    >
      <button
        className="shrink-0 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={[
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors',
          todo.completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/40 bg-transparent hover:border-primary',
        ].join(' ')}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </button>
      {editing ? (
        <input
          ref={editInputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleEditKeyDown}
          maxLength={500}
          className="flex-1 rounded border border-input bg-transparent px-1 text-sm leading-snug outline-none focus:border-primary"
        />
      ) : (
        <span className={[
          'flex-1 text-sm leading-snug',
          todo.completed ? 'line-through text-muted-foreground' : 'text-foreground',
        ].join(' ')}>
          {todo.content}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
        aria-label="Edit task"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={() => onRemove(todo.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        aria-label="Delete task"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );

  if (!onMove || !prevDate || !nextDate) return item;

  return (
    <ContextMenu>
      <ContextMenuTrigger>{item}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onMove(todo.id, prevDate)}>
          Move to previous day
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMove(todo.id, nextDate)}>
          Move to next day
        </ContextMenuItem>
        {nextMonday && (
          <ContextMenuItem onClick={() => onMove(todo.id, nextMonday)}>
            Move to next Monday
          </ContextMenuItem>
        )}
        {prevFriday && (
          <ContextMenuItem onClick={() => onMove(todo.id, prevFriday)}>
            Move to previous Friday
          </ContextMenuItem>
        )}
        {onRequestCustomMove && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onRequestCustomMove(todo.id, todo.entryDate)}>
              Move to custom date…
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  date?: string;
  onAdd: (content: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onReorder: (newOrder: Todo[]) => Promise<void>;
  onMove?: (id: string, targetDate: string) => void;
  onExpand?: () => void;
}

export function TodoList({ todos, loading, date, onAdd, onToggle, onRemove, onEdit, onReorder, onMove, onExpand }: TodoListProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [customMoveTodo, setCustomMoveTodo] = useState<{ id: string; entryDate: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleAdd() {
    const content = input.trim();
    if (!content) return;
    setInput('');
    onAdd(content).catch(() => toast.error('Failed to add task'));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    onReorder(arrayMove(todos, oldIndex, newIndex));
  }

  const doneCount = todos.filter((t) => t.completed).length;

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tasks</Label>
        <div className="flex items-center gap-1">
          {todos.length > 0 && (
            <span className="text-xs text-muted-foreground">{doneCount}/{todos.length}</span>
          )}
          {onExpand && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExpand} aria-label="Open full todo view">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {todos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-0.5">
              {todos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  date={date}
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onEdit={onEdit}
                  onMove={onMove}
                  onRequestCustomMove={onMove ? (id, entryDate) => setCustomMoveTodo({ id, entryDate }) : undefined}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex gap-1.5">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task…"
          className="h-7 text-sm"
          maxLength={500}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={handleAdd}
          disabled={!input.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={customMoveTodo !== null} onOpenChange={(open) => { if (!open) setCustomMoveTodo(null); }}>
        <DialogContent showCloseButton={false} className="w-fit p-4">
          <DialogHeader>
            <DialogTitle>Move to date</DialogTitle>
          </DialogHeader>
          {customMoveTodo && (
            <Calendar
              mode="single"
              selected={parseISO(customMoveTodo.entryDate)}
              defaultMonth={parseISO(customMoveTodo.entryDate)}
              onSelect={(day) => {
                if (day && onMove) {
                  onMove(customMoveTodo.id, format(day, 'yyyy-MM-dd'));
                  setCustomMoveTodo(null);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
