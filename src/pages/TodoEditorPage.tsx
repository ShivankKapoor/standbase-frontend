import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { format, parseISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Toaster } from 'sonner';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { TodoList } from '../components/entry/TodoList';
import { useTodos } from '../hooks/useTodos';

export function TodoEditorPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { todos, loading, addTodo, toggleTodo, cancelTodo, removeTodo, reorderTodo, editTodo, moveTodo } = useTodos(date ?? null);

  const parsedDate = date ? parseISO(date) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6 px-safe pb-safe">
        <div className="mb-4 flex items-center gap-3 sm:mb-6">
          <Button variant="ghost" size="icon" aria-label="Back to calendar" onClick={() => navigate('/')}>
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

        <TodoList
          todos={todos}
          loading={loading}
          date={date}
          onAdd={addTodo}
          onToggle={toggleTodo}
          onCancel={cancelTodo}
          onRemove={removeTodo}
          onEdit={editTodo}
          onReorder={reorderTodo}
          onMove={moveTodo}
        />
      </main>

      <Toaster richColors position="bottom-center" mobileOffset={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }} />
    </div>
  );
}
