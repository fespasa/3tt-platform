import type { CourseLevel } from "@/types/database.types";

const LEVEL_STYLES: Record<CourseLevel, string> = {
  fundamentos:      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  avanzado:         "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
  especializacion:  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
  elite:            "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
};

const LEVEL_LABELS: Record<CourseLevel, string> = {
  fundamentos: "Fundamentos",
  avanzado: "Avanzado",
  especializacion: "Especialización",
  elite: "Élite",
};

export default function CourseLevelBadge({ level }: { level: CourseLevel }) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.fundamentos;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${style}`}>
      {LEVEL_LABELS[level] ?? level}
    </span>
  );
}
