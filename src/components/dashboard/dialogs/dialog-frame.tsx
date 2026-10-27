"use client";

import type { ReactNode } from "react";
import { cn } from "cn";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function DialogFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 440,
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
  icon?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "scroll-thin flex max-h-[calc(100dvh-32px)] flex-col gap-0 overflow-hidden rounded-[16px] border border-[#00000014] bg-white p-0 text-[#0F172A] shadow-[0_24px_80px_rgba(15,23,42,0.24)] duration-150 data-open:duration-150 data-closed:duration-150 max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[20px]",
        )}
        style={{ width, maxWidth: "calc(100vw - 24px)" }}
      >
        <div className="flex items-start gap-3 px-5 pb-4 pt-5">
          {icon && (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF7ED] text-[#FF5722]">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[15px] font-semibold leading-5 tracking-[-0.01em] text-[#0F172A]">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-[12px] leading-[18px] text-[#8C8A85]">
                {description}
              </DialogDescription>
            )}
          </div>
        </div>
        {children && (
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            {children}
          </div>
        )}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#0000000F] bg-white px-5 py-3.5">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PaperInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-[8px] border border-[#00000014] bg-white px-2.5 text-[13px] leading-4 text-[#0F172A] outline-none transition-shadow placeholder:text-[#94A3B8] focus:border-[#FF572266] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function PaperTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-[8px] border border-[#00000014] bg-white px-2.5 py-2 text-[13px] leading-5 text-[#0F172A] outline-none transition-shadow placeholder:text-[#94A3B8] focus:border-[#FF572266] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 items-center rounded-[8px] bg-[#FF5722] px-3.5 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(255,87,34,0.20)] transition-colors hover:bg-[#E64A19] active:bg-[#D84315] disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function GhostButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 items-center rounded-[8px] px-2.5 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A]",
        className,
      )}
      {...props}
    />
  );
}
