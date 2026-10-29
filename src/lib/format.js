export function formatBaht(amount) {
  const num = Number(amount);
  if (num < 0) {
    return `-฿${Math.abs(num).toLocaleString('th-TH', { maximumFractionDigits: 2 })}`;
  }
  return `฿${num.toLocaleString('th-TH', { maximumFractionDigits: 2 })}`;
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return new Date(dateStr);
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  return new Date(dateStr);
}

export function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
