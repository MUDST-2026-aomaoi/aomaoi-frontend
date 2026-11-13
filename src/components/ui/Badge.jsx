export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-[#E6F0D6] text-[#2E4A1F]',
    success: 'bg-[#E6F0D6] text-[#2E4A1F]',
    danger: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
