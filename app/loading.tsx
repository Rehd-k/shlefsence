import { BrandLogo } from "@/components/brand/BrandLogo";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <BrandLogo size="lg" surface="auto" className="animate-pulse rounded-2xl" />
        <p className="text-xs font-semibold text-slate-500">Loading ShelfSense…</p>
      </div>
    </div>
  );
}
