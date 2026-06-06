export async function GET() {
  return new Response(
    "google.com, pub-1582674739139734, DIRECT, f08c47fec0942fa0",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}