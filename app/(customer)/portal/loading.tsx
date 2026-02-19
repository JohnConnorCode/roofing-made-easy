export default function PortalLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome header skeleton */}
      <div>
        <div className="h-7 w-52 rounded-lg bg-slate-700/50 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-700/30 animate-pulse" />
      </div>

      {/* Hero card skeleton */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-700/50 animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-48 rounded bg-slate-700/50 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-slate-700/30 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-[#c9a25c]/15 animate-pulse" />
        </div>
      </div>

      {/* Progress timeline skeleton */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
        <div className="h-5 w-32 rounded bg-slate-700/50 animate-pulse mb-4" />
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="h-8 w-8 rounded-full bg-slate-700/50 animate-pulse" />
              <div className="h-3 w-16 rounded bg-slate-700/30 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Two-column grid skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
            <div className="h-5 w-36 rounded bg-slate-700/50 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 w-full rounded-lg bg-slate-700/30 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Three-column cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-slate-700/50 animate-pulse" />
              <div className="h-5 w-24 rounded bg-slate-700/50 animate-pulse" />
            </div>
            <div className="h-4 w-full rounded bg-slate-700/30 animate-pulse" />
            <div className="mt-2 h-4 w-3/4 rounded bg-slate-700/30 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
