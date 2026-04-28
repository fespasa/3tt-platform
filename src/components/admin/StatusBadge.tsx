const COLORS: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  active:    "bg-emerald-100 text-emerald-700",
  inactive:  "bg-gray-100 text-gray-500",
  true:      "bg-emerald-100 text-emerald-700",
  false:     "bg-gray-100 text-gray-500",
};

export default function StatusBadge({ status }: { status: string | boolean }) {
  const key = String(status);
  const color = COLORS[key] ?? "bg-gray-100 text-gray-500";
  const label = typeof status === "boolean" ? (status ? "Activo" : "Inactivo") : status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}
