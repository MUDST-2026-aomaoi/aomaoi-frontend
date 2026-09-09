export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-xl border border-farm-secondary/40 bg-white p-4 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
