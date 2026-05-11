import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeHHMMH(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}H`;
}

/**
 * Parses a string where spaces are delimiters, but handles quotes for phrases.
 * Example: 'CLY 1234 "Room Name" "3 pillows" 1945H'
 * Returns: ['CLY', '1234', 'Room Name', '3 pillows', '1945H']
 */
export function parseSpaceSeparatedLine(line: string): string[] {
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const parts: string[] = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    parts.push(match[1] || match[2] || match[0]);
  }

  return parts;
}

export function hhmmhToInputTime(hhmmh: string): string {
  if (!hhmmh || hhmmh.length < 5) return "";
  const hours = hhmmh.substring(0, 2);
  const minutes = hhmmh.substring(2, 4);
  return `${hours}:${minutes}`;
}

export function inputTimeToHHMMH(time: string): string {
  if (!time) return "";
  return time.replace(":", "") + "H";
}

export function parseGuestRequests(logs: { guestReq: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  logs.forEach(log => {
    if (!log.guestReq) return;
    
    // Split by comma or space if multiple items
    const items = log.guestReq.split(/[, ]+/);
    
    items.forEach(item => {
      const trimmed = item.trim().toLowerCase();
      if (!trimmed) return;
      
      // Match number and label (e.g., "3bt", "bt")
      const match = trimmed.match(/^(\d+)?([a-z]+)$/);
      if (match) {
        const count = match[1] ? parseInt(match[1], 10) : 1;
        const label = match[2];
        counts[label] = (counts[label] || 0) + count;
      } else {
        // Fallback for non-standard labels
        counts[trimmed] = (counts[trimmed] || 0) + 1;
      }
    });
  });
  
  return counts;
}
