export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-4 py-2.5 font-medium transition-colors duration-200";
  const variants = {
    primary: "rounded bg-farm-primary text-white hover:bg-green-800",
    outline: "rounded border border-farm-primary text-farm-primary hover:bg-farm-bg",
    danger: "rounded bg-red-600 text-white hover:bg-red-700",
    accent: "rounded bg-farm-accent text-white hover:brightness-90",
    subtle: "rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
