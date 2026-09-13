"use client"

import { useState } from "react"

import { SeverityBadge } from "@/components/severity-badge"
import { Button } from "@/components/ui/button"
import type { IocLookupResult } from "@/lib/types"

type Status = "idle" | "loading" | "error" | "done"
type LogKind = "call" | "return" | "http"
interface LogLine {
  message: string
  kind: LogKind
}

const KIND_STYLES: Record<LogKind, string> = {
  call: "text-blue-600 dark:text-blue-400",
  return: "text-muted-foreground",
  http: "text-amber-600 dark:text-amber-400",
}

export function IocLookup() {
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [logs, setLogs] = useState<LogLine[]>([])
  const [results, setResults] = useState<IocLookupResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const values = input
      .split(/[\s,]+/)
      .map((v) => v.trim())
      .filter(Boolean)

    if (values.length === 0) return

    setStatus("loading")
    setLogs([])
    setResults([])
    setError(null)

    try {
      const res = await fetch("/api/iocs/lookup/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      })

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? body.error ?? `Request failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line)

          if (event.event === "log") {
            setLogs((prev) => [...prev, { message: event.message, kind: event.kind }])
          } else if (event.event === "result") {
            setResults((prev) => [...prev, event.result as IocLookupResult])
          }
        }
      }

      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  return (
    <section className="flex flex-col gap-3 border border-border p-4">
      <div>
        <h2 className="font-medium">Test IOCs</h2>
        <p className="text-sm text-muted-foreground">
          Paste one or more IPs, domains, URLs, or file hashes (comma, space, or newline
          separated).
        </p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder={"8.8.8.8\nexample.com\n44d88612fea8a8f36de82e1278abb02f"}
        className="w-full resize-y border border-border bg-transparent p-2 font-mono text-sm outline-none focus-visible:border-ring"
      />

      <Button
        size="sm"
        className="w-fit"
        onClick={submit}
        disabled={status === "loading" || input.trim().length === 0}
      >
        {status === "loading" ? "Looking up…" : "Lookup"}
      </Button>

      {error && <p className="text-sm text-destructive">Failed: {error}</p>}

      {logs.length > 0 && (
        <pre className="max-h-40 overflow-auto bg-muted p-2 font-mono text-xs">
          {logs.map((line, idx) => (
            <div key={idx} className={KIND_STYLES[line.kind]}>
              {line.message}
            </div>
          ))}
        </pre>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((result, idx) => (
            <div key={`${result.value}-${idx}`} className="border border-border/60 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={result.enriched?.severity ?? null} />
                <span className="font-mono text-sm">{result.value}</span>
                {result.ioc_type && (
                  <span className="text-xs text-muted-foreground">({result.ioc_type})</span>
                )}
                {result.enriched && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    via {result.enriched.provider}
                  </span>
                )}
              </div>
              {result.error && (
                <p className="mt-1 text-xs text-destructive">{result.error}</p>
              )}
              {result.enriched && Object.keys(result.enriched.details).length > 0 && (
                <pre className="mt-2 max-h-48 overflow-auto bg-muted p-2 text-xs">
                  {JSON.stringify(result.enriched.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
