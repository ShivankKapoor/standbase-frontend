import { format, parseISO } from 'date-fns';
import { Ban, CalendarDays, CalendarArrowDown, CalendarArrowUp, Pencil, Trash2, Undo2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import type { Todo } from '../../types';

export interface TodoMoveTargets {
  prevDate: string;
  nextDate: string;
  nextMonday: string | null;
  prevFriday: string | null;
}

interface TodoActionSheetProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moveTargets: TodoMoveTargets | null;
  onEdit: () => void;
  onCancel: () => void;
  onRemove: () => void;
  onMove?: (targetDate: string) => void;
  onRequestCustomMove?: () => void;
}

function ActionRow({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-base active:bg-accent',
        destructive ? 'text-destructive' : 'text-popover-foreground',
      ].join(' ')}
    >
      <span className="text-muted-foreground [&_svg]:size-5">{icon}</span>
      {label}
    </button>
  );
}

function shortDay(date: string) {
  return format(parseISO(date), 'EEE d MMM');
}

/** Touch-friendly replacement for the right-click context menu: a bottom action sheet. */
export function TodoActionSheet({
  todo,
  open,
  onOpenChange,
  moveTargets,
  onEdit,
  onCancel,
  onRemove,
  onMove,
  onRequestCustomMove,
}: TodoActionSheetProps) {
  function run(fn: () => void) {
    onOpenChange(false);
    fn();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-0 left-0 max-w-full translate-x-0 translate-y-0 gap-2 rounded-b-none rounded-t-2xl p-2 pb-safe-4 sm:max-w-full data-open:slide-in-from-bottom data-open:zoom-in-100 data-closed:slide-out-to-bottom data-closed:zoom-out-100"
      >
        <DialogHeader className="px-3 pt-2">
          <DialogTitle className="line-clamp-2 text-sm font-medium text-muted-foreground">{todo.content}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <ActionRow icon={<Pencil />} label="Edit task" onClick={() => run(onEdit)} />
          <ActionRow
            icon={todo.cancelled ? <Undo2 /> : <Ban />}
            label={todo.cancelled ? 'Restore task' : 'Cancel task'}
            onClick={() => run(onCancel)}
          />
          {onMove && moveTargets && (
            <>
              <ActionRow icon={<CalendarArrowUp />} label={`Move to ${shortDay(moveTargets.prevDate)}`} onClick={() => run(() => onMove(moveTargets.prevDate))} />
              <ActionRow icon={<CalendarArrowDown />} label={`Move to ${shortDay(moveTargets.nextDate)}`} onClick={() => run(() => onMove(moveTargets.nextDate))} />
              {moveTargets.nextMonday && (
                <ActionRow icon={<CalendarArrowDown />} label="Move to next Monday" onClick={() => run(() => onMove(moveTargets.nextMonday!))} />
              )}
              {moveTargets.prevFriday && (
                <ActionRow icon={<CalendarArrowUp />} label="Move to previous Friday" onClick={() => run(() => onMove(moveTargets.prevFriday!))} />
              )}
              {onRequestCustomMove && (
                <ActionRow icon={<CalendarDays />} label="Move to custom date…" onClick={() => run(onRequestCustomMove)} />
              )}
            </>
          )}
          <ActionRow icon={<Trash2 />} label="Delete task" destructive onClick={() => run(onRemove)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
