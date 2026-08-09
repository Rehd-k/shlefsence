"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 dark:bg-slate-950">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Something went wrong</h2>
      <p className="max-w-md text-center text-xs text-slate-500">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  );
}
