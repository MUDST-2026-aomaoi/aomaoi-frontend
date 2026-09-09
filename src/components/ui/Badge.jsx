export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-farm-bg text-farm-text/70 border border-farm-secondary/40',
    success: 'bg-green-100 text-green-800 border border-green-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
