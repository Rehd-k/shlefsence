"use client";

export default function SalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">Sales failed to load</h2>
      <p className="text-xs text-slate-500">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
      >
        Retry
      </button>
    </div>
  );
}
