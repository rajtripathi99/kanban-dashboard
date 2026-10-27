"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none transition-all",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:border-[#FF5722] focus-visible:ring-[3px] focus-visible:ring-[#FF5722]/25",
        "data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        "data-checked:bg-[#FF5722] data-unchecked:bg-[#E2E8F0]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.18)] ring-0 transition-transform",
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]",
          "group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)]",
          "group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=sm]/switch:data-unchecked:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
