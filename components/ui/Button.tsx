import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'google';
  isLoading?: boolean;
}

export function Button({ children, variant = 'primary', isLoading, className, ...props }: ButtonProps) {
  
  const baseStyles = "w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group active:scale-95";
  
  const variants = {
    primary: "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]",
    secondary: "bg-[#fbbf24] text-black hover:bg-[#f59e0b] shadow-[0_0_20px_rgba(251,191,36,0.3)]",
    outline: "border border-white/20 text-white hover:bg-white/5",
    google: "bg-white text-black hover:bg-gray-100 border border-gray-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}