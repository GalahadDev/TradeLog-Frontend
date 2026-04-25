import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPnLColorClass(pnl: number): string {
  if (pnl > 0) return "text-profit";
  if (pnl < 0) return "text-loss";
  return "text-gold";
}

export function safeDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return format(new Date(year, month - 1, day), "dd MMM", { locale: es });
  } catch {
    return "-";
  }
}

export function normalizeTradeDate(dateString: string | undefined | null): string | null {
  if (!dateString) return null;
  return new Date(dateString + 'T12:00:00').toISOString();
}
