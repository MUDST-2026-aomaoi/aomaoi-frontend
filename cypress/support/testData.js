// Shared helpers for building unique, re-runnable test data.

export function runId() {
  return Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// Letters only (no digits) - safe for fullName / nickname, which zod rejects
// if they contain any digit.
export function letterSuffix(n = 5) {
  return Array.from({ length: n }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
}

export function uniqueFullName(prefixTh) {
  return `${prefixTh} ${letterSuffix(6)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
