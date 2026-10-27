"use client";

import type { ReactNode } from "react";

export function ViewHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-[#0000000F] bg-white px-6 py-5">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-[10px] font-bold uppercase leading-3 tracking-[0.08em] text-[#8C8A85]">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[20px] font-semibold leading-6 tracking-[-0.015em] text-[#0F172A]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-[52ch] text-[12px] leading-[18px] text-[#8C8A85]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  onClear,
}: {
  title: string;
  description: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F1F5F9]">
        <span className="size-2 rounded-full bg-[#CBD5E1]" />
      </div>
      <h2 className="text-[14px] font-semibold text-[#0F172A]">{title}</h2>
      <p className="max-w-[34ch] text-[12px] leading-[18px] text-[#8C8A85]">
        {description}
      </p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-1 flex h-8 items-center rounded-[8px] bg-[#0F172A] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#1E293B]"
        >
          Clear search and filters
        </button>
      )}
    </div>
  );
}
