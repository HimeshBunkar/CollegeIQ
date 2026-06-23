import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPackage(amount: number): string {
  return `₹${amount.toFixed(1)} LPA`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getChanceLevel(probability: number): "HIGH" | "MEDIUM" | "LOW" {
  if (probability >= 70) return "HIGH";
  if (probability >= 40) return "MEDIUM";
  return "LOW";
}

export function getChanceColor(level: "HIGH" | "MEDIUM" | "LOW"): string {
  const map = { HIGH: "text-emerald-600 bg-emerald-50", MEDIUM: "text-amber-600 bg-amber-50", LOW: "text-red-600 bg-red-50" };
  return map[level];
}
