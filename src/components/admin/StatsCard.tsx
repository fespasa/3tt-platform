export default function StatsCard({ icon, label, value, sub }: { icon: string; label: string; value: number | string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray3tt">{label}</span>
      </div>
      <p className="text-3xl font-black text-navy">{value}</p>
      {sub && <p className="text-xs text-gray3tt mt-1">{sub}</p>}
    </div>
  );
}
