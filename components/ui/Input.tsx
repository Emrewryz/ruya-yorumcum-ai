interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>}
      <div className="relative group">
        <input
          className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all duration-300 ${className}`}
          {...props}
        />
        {/* Alt parlama efekti */}
        <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
}