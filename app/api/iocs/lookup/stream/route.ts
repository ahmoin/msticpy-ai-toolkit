const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: Request) {
  const body = await request.text()

  const res = await fetch(`${BACKEND_URL}/api/iocs/lookup/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": "application/x-ndjson" },
  })
}
