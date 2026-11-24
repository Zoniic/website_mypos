// Liveness check for the container host. It does not touch the database, so a
// database outage does not make the host restart a healthy web process.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
