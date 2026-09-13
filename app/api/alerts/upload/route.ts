const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: Request) {
  const formData = await request.formData()

  const res = await fetch(`${BACKEND_URL}/api/alerts/upload`, {
    method: "POST",
    body: formData,
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
