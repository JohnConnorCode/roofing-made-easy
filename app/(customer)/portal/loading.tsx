export default function PortalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-[#c9a25c]" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
