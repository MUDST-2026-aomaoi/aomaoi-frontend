export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${className}`} {...props}>
      {children}
    </div>
  );
}
