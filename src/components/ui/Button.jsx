export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-4 py-2.5 font-semibold transition-all duration-200";
  const variants = {
    primary: "rounded-xl bg-farm-primary text-white hover:bg-[#3D6129]",
    outline: "rounded-xl bg-white text-farm-primary ring-1 ring-inset ring-[#2E4A1F]/20 hover:bg-[#E6F0D6]/60",
    danger: "rounded-xl bg-red-600 text-white hover:bg-red-700",
    accent: "rounded-xl bg-[#4F7A2B] text-white hover:bg-[#2E4A1F]",
    subtle: "rounded-xl bg-white text-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:bg-[#F1F5E8]",
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
