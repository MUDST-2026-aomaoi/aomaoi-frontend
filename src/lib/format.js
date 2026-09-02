export function formatBaht(amount) {
  return `฿${Number(amount).toLocaleString('th-TH', { maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
