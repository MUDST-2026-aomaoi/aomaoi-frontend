/** Task label chip: left colour bar, name, count · amount, bold %. Clickable when onClick is given. */
export function TaskChip({ name, count, value, amount, percent, color, unit, active = false, dimmed = false, className = '', ...rest }) {
  const Tag = rest.onClick ? 'button' : 'div';
  return (
    <Tag
      type={rest.onClick ? 'button' : undefined}
      {...rest}
      className={`flex items-stretch overflow-hidden rounded-xl bg-white/90 text-left shadow-[0_6px_20px_rgba(46,74,31,0.14)] backdrop-blur transition duration-200 hover:-translate-y-0.5 ${
        active ? '-translate-y-0.5 ring-2 ring-[#A8D04A]' : ''
      } ${dimmed ? 'opacity-35' : ''} ${className}`}
    >
      <span className="w-1.5 shrink-0" style={{ backgroundColor: color }} />
      <span className="flex min-w-0 items-center gap-3 px-3 py-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[#1A1A1A]">{name}</span>
          <span className="block truncate text-[11px] text-[#8A8F85]">
            {count} {unit.items} · {amount ?? value} {unit.baht}
          </span>
        </span>
        <span className="shrink-0 text-lg font-extrabold leading-none text-[#2E4A1F]">{percent}%</span>
      </span>
    </Tag>
  );
}
