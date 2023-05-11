export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  writer.write(encoder.encode("Hello, world!"));

  Array.from({ length: 11 }, (_, i) => i).forEach(async (i) => {
    await new Promise((resolve) => setTimeout(resolve, 1000 * i + 1000));
    if (i === 10) {
      writer.write(encoder.encode(`\nThat's all, folks!`));
      writer.close();
      return;
    }

    writer.write(encoder.encode(`\n${i + 1} mississippi`));
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
