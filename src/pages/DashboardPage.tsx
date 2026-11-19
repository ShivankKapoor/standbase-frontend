import { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'sonner';
import { Header } from '../components/layout/Header';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { ScrollCalendar } from '../components/calendar/ScrollCalendar';
import { EntryPanel } from '../components/entry/EntryPanel';
import { Drawer, DrawerContent } from '../components/ui/drawer';
import { useCalendarData } from '../hooks/useCalendarData';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Todo } from '../types';

export function DashboardPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [panelDate, setPanelDate] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const isMobile = useIsMobile();

  const { entryMap, todoSummary, ensureMonth, updateEntry, removeEntry, updateTodoSummary, refreshTodoSummary } = useCalendarData();
  const entries = useMemo(
    () => Object.entries(entryMap).map(([date, dayType]) => ({ date, dayType })),
    [entryMap],
  );

  // The paged (desktop) calendar loads the month it is showing; the scrolling one loads as you scroll.
  useEffect(() => {
    ensureMonth(year, month);
  }, [year, month, ensureMonth]);

  function handleTodosChange(date: string, todos: Todo[]) {
    updateTodoSummary(date, todos);
  }

  useEffect(() => {
    if (selectedDate) {
      setPanelDate(selectedDate);
      setClosing(false);
    }
  }, [selectedDate]);

  function closePanel() {
    setClosing(true);
  }

  function handleTransitionEnd() {
    if (closing) {
      setSelectedDate(null);
      setPanelDate(null);
      setClosing(false);
    }
  }

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
    setPanelDate(null);
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
    setPanelDate(null);
  }

  function goToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelectedDate(null);
    setPanelDate(null);
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex flex-1 flex-col min-h-0">
          <div className="flex flex-1 flex-col min-h-0 mx-auto w-full max-w-screen-2xl px-2 py-2 sm:px-4 sm:py-4 px-safe pb-safe">
            {isMobile ? (
              <ScrollCalendar
                entryMap={entryMap}
                todoSummary={todoSummary}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                ensureMonth={ensureMonth}
              />
            ) : (
              <MonthCalendar
                year={year}
                month={month}
                entries={entries}
                todoSummary={todoSummary}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onPrev={prevMonth}
                onNext={nextMonth}
                onToday={goToToday}
              />
            )}
          </div>
        </main>

        {/* Desktop: side panel */}
        {!isMobile && (
          <aside
            className={[
              'shrink-0 overflow-hidden border-l transition-[width] duration-200 ease-in-out',
              panelDate && !closing ? 'w-80' : 'w-0',
            ].join(' ')}
            onTransitionEnd={handleTransitionEnd}
          >
            {panelDate && (
              <div className="sticky top-14 h-[calc(100dvh-3.5rem)] w-80">
                <EntryPanel
                  date={panelDate}
                  onClose={closePanel}
                  onSave={updateEntry}
                  onDelete={removeEntry}
                  onTodosChange={handleTodosChange}
                  onMoveComplete={refreshTodoSummary}
                />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Mobile: bottom drawer */}
      {isMobile && (
        <Drawer open={!!selectedDate} onOpenChange={(open) => { if (!open) { setSelectedDate(null); setPanelDate(null); } }}>
          <DrawerContent className="h-[88dvh] max-h-[88dvh]">
            {panelDate && (
              <EntryPanel
                date={panelDate}
                onClose={() => { setSelectedDate(null); setPanelDate(null); }}
                onSave={updateEntry}
                onDelete={removeEntry}
                onTodosChange={handleTodosChange}
                onMoveComplete={refreshTodoSummary}
              />
            )}
          </DrawerContent>
        </Drawer>
      )}

      <Toaster richColors position="bottom-center" offset={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }} mobileOffset={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }} />
    </div>
  );
}
