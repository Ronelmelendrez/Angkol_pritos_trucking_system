import { useState, useMemo, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { eachDayOfInterval, format, isSameMonth } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { monthRange } from "@/utils/date";
import { cn } from "@/utils/cn";
import { buildDayTotals, type DayTotal } from "@/utils/calendarHeatmap";
import { groupByKey, type GroupedRow } from "@/utils/groupByKey";

interface TransactionViewTabsProps<T> {
  data: T[];
  isLoading: boolean;
  getDate: (item: T) => string;
  getAmount: (item: T) => number;
  renderTable: (data: T[]) => ReactNode;
  renderGridCard: (item: T) => ReactNode;
  groupedTabLabel: string;
  getGroupKey: (item: T) => string;
  getGroupLabel?: (key: string) => string;
  getGroupColor?: (key: string) => string;
  emptyMessage?: string;
}

function CalendarHeatmap<T>({
  dayTotals,
  selectedDate,
  onDayClick,
  calendarMonth,
  onPrevMonth,
  onNextMonth,
  getAmount,
  data,
  getDate,
  renderGridCard,
}: {
  dayTotals: DayTotal[];
  selectedDate: string | null;
  onDayClick: (date: string) => void;
  calendarMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  getAmount: (item: any) => number;
  data: any[];
  getDate: (item: any) => string;
  renderGridCard: (item: any) => ReactNode;
}) {
  const { start, end } = monthRange(calendarMonth);
  const days = eachDayOfInterval({ start, end });
  const leadingBlanks = start.getDay();
  const maxTotal = Math.max(...dayTotals.map((d) => d.total), 1);

  const dayMap = useMemo(() => {
    const map = new Map<string, DayTotal>();
    dayTotals.forEach((d) => map.set(d.date, d));
    return map;
  }, [dayTotals]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return data.filter((item: any) => getDate(item) === selectedDate);
  }, [selectedDate, data, getDate]);

  function intensityClass(total: number): string {
    if (total === 0) return "bg-ink/4 text-ink-faint";
    const ratio = total / maxTotal;
    if (ratio <= 0.25) return "bg-primary/10 text-primary-dark font-medium";
    if (ratio <= 0.5) return "bg-primary/20 text-primary-dark font-semibold";
    if (ratio <= 0.75) return "bg-primary/40 text-white font-semibold";
    return "bg-primary text-white font-bold";
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-ink">
          {format(calendarMonth, "MMMM yyyy")}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-ink-faint">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dt = dayMap.get(key);
          const total = dt?.total ?? 0;
          const inMonth = isSameMonth(day, start);
          const isSelected = selectedDate === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick(key)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors",
                !inMonth && "opacity-30",
                isSelected && "ring-2 ring-primary ring-offset-1",
                intensityClass(total),
              )}
              title={total > 0 ? `${formatCurrency(total)}` : "No transactions"}
            >
              <span>{format(day, "d")}</span>
              {total > 0 && (
                <span className="mt-px text-[9px] font-medium opacity-70">
                  {formatCurrency(total).replace(/[^0-9,.k]/g, "").slice(0, 6)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && selectedDayItems.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">
            {format(new Date(selectedDate), "MMM d, yyyy")}
          </p>
          {selectedDayItems.map((item: any) => renderGridCard(item))}
        </div>
      )}
    </div>
  );
}

export function TransactionViewTabs<T>({
  data,
  isLoading,
  getDate,
  getAmount,
  renderTable,
  renderGridCard,
  groupedTabLabel,
  getGroupKey,
  getGroupLabel,
  getGroupColor,
  emptyMessage,
}: TransactionViewTabsProps<T>) {
  const [activeTab, setActiveTab] = useState("table");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedDate) {
      result = result.filter((item) => getDate(item) === selectedDate);
    }
    if (selectedGroup) {
      result = result.filter((item) => getGroupKey(item) === selectedGroup);
    }
    return result;
  }, [data, selectedDate, selectedGroup, getDate, getGroupKey]);

  const dayTotals = useMemo(
    () => buildDayTotals(data, getDate, getAmount, monthRange(calendarMonth)),
    [data, calendarMonth, getDate, getAmount],
  );

  const groupedRows = useMemo(
    () => groupByKey(data, getGroupKey, getAmount, getGroupLabel),
    [data, getGroupKey, getAmount, getGroupLabel],
  );

  const total = filteredData.reduce((sum, item) => sum + getAmount(item), 0);
  const hasActiveFilter = selectedDate || selectedGroup;

  function handleDayClick(date: string) {
    setSelectedDate((prev) => (prev === date ? null : date));
    setActiveTab("table");
  }

  function handleGroupClick(key: string) {
    setSelectedGroup((prev) => (prev === key ? null : key));
    setActiveTab("table");
  }

  function clearFilters() {
    setSelectedDate(null);
    setSelectedGroup(null);
  }

  return (
    <div>
      {hasActiveFilter && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {selectedDate && (
            <Badge variant="neutral" className="gap-1.5 pr-1.5">
              {format(new Date(selectedDate), "MMM d, yyyy")}
              <button type="button" onClick={() => setSelectedDate(null)} className="ml-0.5 rounded-full p-0.5 hover:bg-ink/10">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedGroup && (
            <Badge variant="neutral" className="gap-1.5 pr-1.5">
              {getGroupLabel?.(selectedGroup) ?? selectedGroup}
              <button type="button" onClick={() => setSelectedGroup(null)} className="ml-0.5 rounded-full p-0.5 hover:bg-ink/10">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-ink-faint underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="grouped">{groupedTabLabel}</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {renderTable(filteredData)}
        </TabsContent>

        <TabsContent value="grid">
          {filteredData.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
              <p className="text-sm font-medium text-ink">{emptyMessage ?? "No transactions"}</p>
              <p className="text-xs text-ink-faint">Try clearing filters above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredData.map((item, idx) => (
                <div key={idx}>{renderGridCard(item)}</div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarHeatmap
            dayTotals={dayTotals}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
            calendarMonth={calendarMonth}
            onPrevMonth={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            onNextMonth={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            getAmount={getAmount}
            data={data}
            getDate={getDate}
            renderGridCard={renderGridCard}
          />
        </TabsContent>

        <TabsContent value="grouped">
          {groupedRows.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
              <p className="text-sm font-medium text-ink">{emptyMessage ?? "No transactions"}</p>
              <p className="text-xs text-ink-faint">Try clearing filters above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupedRows.map((row) => (
                <GroupedRowCard
                  key={row.key}
                  row={row}
                  isSelected={selectedGroup === row.key}
                  color={getGroupColor?.(row.key)}
                  onClick={() => handleGroupClick(row.key)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GroupedRowCard({
  row,
  isSelected,
  color,
  onClick,
}: {
  row: GroupedRow;
  isSelected: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-line bg-surface hover:bg-primary/[0.03]",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: color ?? "#888" }}
        >
          {row.label.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{row.label}</p>
          <p className="text-xs text-ink-faint">{row.count} transaction{row.count === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <div className="w-32">
          <div className="h-2 overflow-hidden rounded-full bg-ink/5">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${row.percentOfTotal}%`, backgroundColor: color ?? "#888" }}
            />
          </div>
          <p className="mt-0.5 text-right text-[11px] text-ink-faint">{row.percentOfTotal.toFixed(0)}%</p>
        </div>
        <span className="w-24 text-right font-semibold text-ink">{formatCurrency(row.total)}</span>
      </div>
    </button>
  );
}
