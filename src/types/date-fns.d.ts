declare module "date-fns" {
  export function format(date: Date | number, formatString: string): string;
  export function subDays(date: Date | number, amount: number): Date;
  export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[];
  export function isSameMonth(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function formatDistanceToNow(date: Date | number, options?: { addSuffix?: boolean }): string;
  export function isToday(date: Date | number): boolean;
  export function isThisMonth(date: Date | number): boolean;
  export function startOfMonth(date: Date | number): Date;
  export function endOfMonth(date: Date | number): Date;
  export function differenceInMinutes(dateLeft: Date | number, dateRight: Date | number): number;
  export function parseISO(argument: string): Date;
}