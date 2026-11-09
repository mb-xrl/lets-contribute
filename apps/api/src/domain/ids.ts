import { randomUUID } from 'node:crypto';

export const newId = () => randomUUID();

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || `project-${randomUUID().slice(0, 6)}`;
}

export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

export function daysAgo(days: number): string {
  return hoursAgo(days * 24);
}
