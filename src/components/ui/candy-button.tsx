import React from "react";
import { cn } from "@/lib/utils";

export interface CandyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'saffron' | 'rose' | 'emerald' | 'amber';
}

const variantStyles: Record<string, string> = {
  blue: "border-[#54A1FD] bg-[radial-gradient(95%_60%_at_50%_75%,#005FD6_0%,#209BFF_100%)] shadow-[0px_4px_48px_-12px_#1187FF,inset_0px_1px_8px_-4px_#FFFFFF]",
  saffron: "border-amber-400 bg-[radial-gradient(95%_60%_at_50%_75%,#D95103_0%,#FF8A00_100%)] shadow-[0px_4px_48px_-12px_#EA580C,inset_0px_1px_8px_-4px_#FFFFFF]",
  rose: "border-rose-400 bg-[radial-gradient(95%_60%_at_50%_75%,#BE123C_0%,#F43F5E_100%)] shadow-[0px_4px_48px_-12px_#E11D48,inset_0px_1px_8px_-4px_#FFFFFF]",
  emerald: "border-emerald-400 bg-[radial-gradient(95%_60%_at_50%_75%,#047857_0%,#10B981_100%)] shadow-[0px_4px_48px_-12px_#059669,inset_0px_1px_8px_-4px_#FFFFFF]",
  amber: "border-amber-300 bg-[radial-gradient(95%_60%_at_50%_75%,#B45309_0%,#F59E0B_100%)] shadow-[0px_4px_48px_-12px_#D97706,inset_0px_1px_8px_-4px_#FFFFFF]",
};

/**
 * CandyButton (from VengeanceUI)
 * - Juicy radial-gradient gloss with top specular reflection highlight
 * - Deep color-matched glow drop-shadow
 * - Active 3D compression with micro-tilt
 */
export function CandyButton({ 
  className, 
  variant = 'blue', 
  children = "Candy Button", 
  ...props 
}: CandyButtonProps) {
  const chosenVariant = variantStyles[variant] || variantStyles.blue;

  return (
    <button
      className={cn(
        "relative text-white font-bold text-sm sm:text-base leading-[22px] tracking-[0.02em]",
        "px-6 sm:px-9 py-2.5 sm:py-3 rounded-2xl cursor-pointer transition-all duration-200 ease-out select-none",
        "border",
        chosenVariant,
        "active:scale-95 active:rotate-1",
        "after:absolute after:top-[1px] after:right-[10%] after:w-[60%] after:h-[1px]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent",
        "hover:brightness-110 active:brightness-95",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

export default CandyButton;
