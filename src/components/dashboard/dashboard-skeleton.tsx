"use client";

export function DashboardSkeleton() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#FAFAF9]">
      <aside className="hidden w-[248px] shrink-0 flex-col gap-4 border-r border-[#0000000F] bg-white p-[16px_14px] md:flex">
        <div className="flex h-7 items-center gap-2 px-1">
          <div className="size-6 animate-pulse rounded-[6px] bg-[#F1F5F9]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[#F1F5F9]" />
        </div>
        <div className="h-[30px] animate-pulse rounded-[8px] bg-[#F6F5F3]" />
        <div className="mt-2 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[30px] animate-pulse rounded-[8px] bg-[#F8FAFC]"
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[30px] animate-pulse rounded-[8px] bg-[#F8FAFC]"
            />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#0000000F] bg-white px-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 animate-pulse rounded bg-[#F1F5F9]" />
            <div className="h-3 w-3 animate-pulse rounded bg-[#F1F5F9]" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#F1F5F9]" />
          </div>
          <div className="flex gap-2">
            <div className="size-8 animate-pulse rounded-[8px] bg-[#F1F5F9]" />
            <div className="size-8 animate-pulse rounded-[8px] bg-[#F1F5F9]" />
          </div>
        </div>
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#0000000F] bg-white px-6">
          <div className="h-8 w-[230px] animate-pulse rounded-[10px] bg-[#F4F4F5]" />
          <div className="flex gap-2">
            <div className="h-8 w-[140px] animate-pulse rounded-[8px] bg-[#F1F5F9]" />
            <div className="size-8 animate-pulse rounded-[8px] bg-[#F1F5F9]" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col gap-3 border-r border-[#0000000F] p-4"
            >
              <div className="flex items-center gap-2 px-0.5">
                <div className="size-[14px] animate-pulse rounded-[3px] bg-[#F1F5F9]" />
                <div className="h-3 w-16 animate-pulse rounded bg-[#F1F5F9]" />
              </div>
              {Array.from({ length: index === 0 ? 2 : 2 }).map((__, card) => (
                <div
                  key={card}
                  className="h-[130px] animate-pulse rounded-[12px] border border-[#0000000A] bg-white"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
