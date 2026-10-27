import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "cn";
import type { CSSProperties } from "react";

export function Icon({
  icon,
  size = 16,
  strokeWidth = 1.8,
  className,
  style,
}: {
  icon: IconSvgElement;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      style={style}
      aria-hidden
    />
  );
}

export function MemberAvatar({
  initials,
  size = 24,
  className,
}: {
  initials: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#0F172A] font-bold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.42)),
        lineHeight: 1,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
