import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
  const { todos, loading, addTodo, toggleTodo, removeTodo, reorderTodo, editTodo } = useTodos(date ?? null);

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

        <TodoList
          todos={todos}
          loading={loading}
          onAdd={addTodo}
          onToggle={toggleTodo}
          onRemove={removeTodo}
          onEdit={editTodo}
          onReorder={reorderTodo}
        />
      </main>

      <Toaster richColors position="bottom-center" />
    </div>
  );
}
