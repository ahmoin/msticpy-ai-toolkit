import { SeverityBadge } from "@/components/severity-badge"
import type { EnrichedIoc } from "@/lib/types"

export function IocCard({ ioc }: { ioc: EnrichedIoc }) {
  return (
    <div className="border border-border/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={ioc.severity} />
        <span className="font-mono text-sm">{ioc.value}</span>
        <span className="text-xs text-muted-foreground">({ioc.ioc_type})</span>
        <span className="ml-auto text-xs text-muted-foreground">via {ioc.provider}</span>
      </div>
      {Object.keys(ioc.details).length > 0 && (
        <pre className="mt-2 max-h-48 overflow-auto bg-muted p-2 text-xs">
          {JSON.stringify(ioc.details, null, 2)}
        </pre>
      )}
    </div>
  )
}
