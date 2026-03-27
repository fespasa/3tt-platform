import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
}

export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("es-ES", opts ?? { dateStyle: "medium" }).format(new Date(dateStr));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Genera las iniciales de un nombre completo */
export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? "")
    .join("");
}
