import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Simple utility to merge Tailwind / className strings in JavaScript
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
