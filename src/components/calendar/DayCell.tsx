import type { DayType } from '../../types';

const dotColour: Record<DayType, string> = {
  PTO:      'bg-sky-500',
  PLANNING: 'bg-violet-500',
  SUPPORT:  'bg-red-500',
};

interface DayCellProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  hasEntry: boolean;
  dayType: DayType | null;
  todoStatus: 'pending' | 'done' | null;
  onClick: () => void;
}

export function DayCell({ day, isToday, isSelected, isWeekend, hasEntry, dayType, todoStatus, onClick }: DayCellProps) {
  const entryDot = hasEntry
    ? dayType
      ? <span className={`h-2 w-2 sm:h-1.5 sm:w-1.5 rounded-full ${dotColour[dayType]}`} />
      : <span className="h-2 w-2 sm:h-1.5 sm:w-1.5 rounded-full bg-[#FF6319]" />
    : null;

  const todoDot = todoStatus
    ? <span className={`h-2 w-2 sm:h-1.5 sm:w-1.5 rounded-sm ${todoStatus === 'done' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
    : null;

  return (
    <button
      onClick={onClick}
      aria-label={`Day ${day}${hasEntry ? ', has standup' : ''}${todoStatus ? (todoStatus === 'done' ? ', tasks done' : ', tasks pending') : ''}`}
      aria-pressed={isSelected}
      className={[
        'group relative flex h-full w-full flex-col items-center sm:items-start p-0.5 pt-1.5 sm:p-2 text-left transition-colors',
        isSelected ? 'sm:bg-accent sm:ring-2 sm:ring-inset sm:ring-primary' : 'sm:hover:bg-accent/40',
      ].join(' ')}
    >
      <span className={[
        'flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-full text-base sm:text-sm font-medium transition-colors',
        isToday
          ? 'bg-primary text-primary-foreground'
          : isSelected
            ? 'max-sm:bg-foreground max-sm:text-background'
            : '',
        !isToday && !isSelected ? (isWeekend ? 'text-muted-foreground/50' : 'text-foreground') : '',
        isToday && isSelected ? 'max-sm:ring-2 max-sm:ring-foreground max-sm:ring-offset-2 max-sm:ring-offset-background' : '',
      ].join(' ')}>
        {day}
      </span>
      <div className="mt-1 flex h-2 flex-row items-center gap-1 sm:h-auto sm:flex-col sm:items-start sm:gap-0.5">
        {entryDot}
        {todoDot}
      </div>
    </button>
  );
}
