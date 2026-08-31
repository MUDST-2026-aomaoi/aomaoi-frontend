export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-4 py-2 rounded font-medium transition-colors duration-200";
  const variants = {
    primary: "bg-farm-primary text-white hover:bg-green-800",
    outline: "border border-farm-primary text-farm-primary hover:bg-farm-bg",
    danger: "bg-red-600 text-white hover:bg-red-700"
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
