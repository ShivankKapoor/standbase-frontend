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
  onClick: () => void;
}

export function DayCell({ day, isToday, isSelected, isWeekend, hasEntry, dayType, onClick }: DayCellProps) {
  const dot = hasEntry
    ? dayType
      ? <span className={`mt-1 h-1.5 w-1.5 rounded-full ${dotColour[dayType]}`} />
      : <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FF6319]" />
    : null;

  return (
    <button
      onClick={onClick}
      className={[
        'group relative flex h-full w-full flex-col items-start p-1 sm:p-2 text-left transition-colors',
        isSelected ? 'bg-accent ring-2 ring-inset ring-primary' : 'hover:bg-accent/40',
      ].join(' ')}
    >
      <span className={[
        'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
        isToday ? 'bg-primary text-primary-foreground' : isWeekend ? 'text-muted-foreground/50' : 'text-foreground',
      ].join(' ')}>
        {day}
      </span>
      {dot}
    </button>
  );
}
