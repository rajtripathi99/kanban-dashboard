"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "cn";

export function IconButton({
  label,
  active = false,
  size = 28,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  size?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-active={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[7px] text-[#8C8A85] transition-colors duration-150",
        "hover:bg-[#F4F4F5] hover:text-[#475569]",
        "focus-visible:paper-focus outline-none",
        "data-[active=true]:bg-[#F4F4F5] data-[active=true]:text-[#0F172A]",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-[#00000014] bg-[#FAFAFA] px-1 font-sans text-[10px] font-medium leading-none text-[#8C8A85]">
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase leading-4 tracking-[0.06em] text-[#8C8A85]">
      {children}
    </div>
  );
}
