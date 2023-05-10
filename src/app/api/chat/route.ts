import { Redis } from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  const client = new Redis(process.env.REDIS_URL!);

  client.subscribe('streaming-chat');
  client.on('message', (channel, message) => {
    writer.write(encoder.encode(`data: ${message}\n\n`));
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: Request) {
  const { content, username, id, userId } = await request.json();
  const client = new Redis(process.env.REDIS_URL!);
  await client.publish('streaming-chat', JSON.stringify({ content, username, id, userId }));
  client.quit();
  return new Response('OK');
}
