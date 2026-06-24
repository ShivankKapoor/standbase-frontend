import { useRef, useState } from 'react';
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
import { Check, GripVertical, Maximize2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Todo } from '../../types';

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
}

function SortableTodoItem({ todo, onToggle, onRemove }: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  return (
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
      <span className={[
        'flex-1 text-sm leading-snug',
        todo.completed ? 'line-through text-muted-foreground' : 'text-foreground',
      ].join(' ')}>
        {todo.content}
      </span>
      <button
        onClick={() => onRemove(todo.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        aria-label="Delete task"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
}

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onAdd: (content: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
  onReorder: (newOrder: Todo[]) => Promise<void>;
  onExpand?: () => void;
}

export function TodoList({ todos, loading, onAdd, onToggle, onRemove, onReorder, onExpand }: TodoListProps) {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleAdd() {
    const content = input.trim();
    if (!content) return;
    setAdding(true);
    try {
      await onAdd(content);
      setInput('');
      inputRef.current?.focus();
    } catch {
      toast.error('Failed to add task');
    } finally {
      setAdding(false);
    }
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
                  onToggle={onToggle}
                  onRemove={onRemove}
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
          disabled={adding}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={handleAdd}
          disabled={!input.trim() || adding}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
