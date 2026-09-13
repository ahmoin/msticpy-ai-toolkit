import { cn } from "@/lib/utils"

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-destructive/10 text-destructive",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  information: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  unknown: "bg-muted text-muted-foreground",
}

export function SeverityBadge({ severity }: { severity: string | null | undefined }) {
  const key = severity?.toLowerCase() ?? "unknown"
  const style = SEVERITY_STYLES[key] ?? SEVERITY_STYLES.unknown

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-semibold tracking-widest uppercase",
        style
      )}
    >
      {severity ?? "unknown"}
    </span>
  )
}
