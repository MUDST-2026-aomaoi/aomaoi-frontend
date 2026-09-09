export function Avatar({ src, name, className = 'h-8 w-8 text-xs' }) {
  if (src) {
    return <img src={src} alt={name} className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-farm-secondary/40 font-semibold text-farm-text ${className}`}>
      {name.charAt(0)}
    </div>
  );
}
