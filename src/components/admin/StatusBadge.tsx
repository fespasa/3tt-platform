const COLORS: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  draft:     "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  active:    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  inactive:  "bg-gray-500/10 text-gray-500 border border-gray-500/20",
  true:      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  false:     "bg-gray-500/10 text-gray-500 border border-gray-500/20",
};

export default function StatusBadge({ status }: { status: string | boolean }) {
  const key = String(status);
  const color = COLORS[key] ?? "bg-gray-500/10 text-gray-500 border border-gray-500/20";
  const label = typeof status === "boolean" ? (status ? "Activo" : "Inactivo") : status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}
