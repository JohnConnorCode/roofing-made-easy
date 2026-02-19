export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
            </div>
            <div className="mt-3 h-8 w-24 rounded-lg bg-slate-200 animate-pulse" />
            <div className="mt-2 h-3 w-32 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main content area skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-32 rounded bg-slate-200 animate-pulse mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
                  <div className="mt-1 h-3 w-32 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-28 rounded bg-slate-200 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
