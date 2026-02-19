export default function FunnelLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-pulse">
      {/* Progress bar skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 rounded bg-slate-700/50" />
          <div className="h-3 w-10 rounded bg-slate-700/50" />
        </div>
        <div className="h-2 w-full rounded-full bg-slate-700/30">
          <div className="h-2 w-1/3 rounded-full bg-[#c9a25c]/20" />
        </div>
      </div>

      {/* Step title skeleton */}
      <div className="text-center mb-8">
        <div className="mx-auto h-7 w-56 rounded-lg bg-slate-700/50 mb-3" />
        <div className="mx-auto h-4 w-72 rounded bg-slate-700/30" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-6">
        {/* Option cards grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-700/40 mb-3" />
              <div className="h-4 w-20 rounded bg-slate-700/50" />
              <div className="mt-1 h-3 w-16 rounded bg-slate-700/30" />
            </div>
          ))}
        </div>

        {/* Input fields skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full rounded-lg bg-slate-800/40 border border-slate-700/30" />
          <div className="h-12 w-full rounded-lg bg-slate-800/40 border border-slate-700/30" />
        </div>
      </div>

      {/* Navigation buttons skeleton */}
      <div className="mt-8 flex items-center justify-between">
        <div className="h-11 w-24 rounded-lg bg-slate-700/30" />
        <div className="h-11 w-32 rounded-lg bg-[#c9a25c]/15" />
      </div>
    </div>
  )
}
