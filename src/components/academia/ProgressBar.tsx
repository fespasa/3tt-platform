export default function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
