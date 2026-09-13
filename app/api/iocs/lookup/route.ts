const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: Request) {
  const body = await request.text()

  const res = await fetch(`${BACKEND_URL}/api/iocs/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
