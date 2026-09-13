"use client"

import { useRef, useState } from "react"

import { IocCard } from "@/components/ioc-card"
import { SeverityBadge } from "@/components/severity-badge"
import { Button } from "@/components/ui/button"
import type { EnrichedAlert } from "@/lib/types"

type UploadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; alerts: EnrichedAlert[] }

const EXAMPLE_ALERT = {
  alert_id: "alert-001",
  timestamp: "2026-09-10T14:32:11Z",
  title: "Suspicious outbound connection detected",
  severity: "medium",
  host: "WIN-DESKTOP-07",
  description: "Endpoint made an outbound connection to a rarely-seen external IP.",
  iocs: [
    { ioc_type: "ipv4", value: "185.220.101.45" },
    { ioc_type: "dns", value: "example.com" },
  ],
}

function downloadTemplate() {
  const blob = new Blob([JSON.stringify([EXAMPLE_ALERT], null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "alert-template.json"
  link.click()
  URL.revokeObjectURL(url)
}

export function AlertUpload() {
  const [state, setState] = useState<UploadState>({ status: "idle" })
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setState({ status: "loading" })
    const formData = new FormData()
    formData.append("file", file)

    fetch("/api/alerts/upload", { method: "POST", body: formData })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.detail ?? body.error ?? `Request failed (${res.status})`)
        }
        return res.json() as Promise<EnrichedAlert[]>
      })
      .then((alerts) => setState({ status: "ready", alerts }))
      .catch((err) =>
        setState({ status: "error", message: err instanceof Error ? err.message : String(err) })
      )
  }

  return (
    <section className="flex flex-col gap-3 border border-border p-4">
      <div>
        <h2 className="font-medium">Upload alert data</h2>
        <p className="text-sm text-muted-foreground">
          Upload a JSON file of alerts to ingest and enrich.
        </p>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">
          What format should my file be?
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-muted-foreground">
            A JSON array of alerts. Each alert needs an id, timestamp, title, severity
            (low/medium/high/critical), host, description, and a list of IOCs
            (ipv4, ipv6, dns, url, or file_hash):
          </p>
          <pre className="max-h-64 overflow-auto bg-muted p-2 text-xs">
            {JSON.stringify([EXAMPLE_ALERT], null, 2)}
          </pre>
          <Button size="sm" variant="outline" className="w-fit" onClick={downloadTemplate}>
            Download template
          </Button>
        </div>
      </details>

      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <Button
        size="sm"
        variant="outline"
        className="w-fit"
        onClick={() => inputRef.current?.click()}
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? "Uploading…" : "Choose file"}
      </Button>

      {state.status === "error" && (
        <p className="text-sm text-destructive">Failed: {state.message}</p>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-6">
          {state.alerts.map((alert) => (
            <article key={alert.alert_id} className="border border-border/60 p-4">
              <header className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={alert.severity} />
                <h3 className="font-medium">{alert.title}</h3>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {alert.alert_id}
                </span>
              </header>
              <div className="mt-3 flex flex-col gap-2">
                {alert.enriched_iocs.map((ioc, idx) => (
                  <IocCard key={`${alert.alert_id}-${idx}`} ioc={ioc} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
