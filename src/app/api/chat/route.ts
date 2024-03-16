import { Redis } from 'ioredis';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  const client = new Redis(process.env.REDIS_URL!);

  // req.signal.onabort = () => {
  //   console.log("abort");
  //   writer.close();
  // };

  client.subscribe('streaming-chat');
  client.on('message', (channel, message) => {
    console.log('Received message %s from channel %s', message, channel);
    const { content, username, id, userId } = JSON.parse(message);
    const messageLines = [
      `id: ${id}`,
      `event: chat.message`,
      `retry: 10000`,
      `data: ${message}`,
      '\n',
    ];

    writer.write(encoder.encode(messageLines.join('\n')));
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
  const { content, username, id, userId, date } = await request.json();
  const client = new Redis(process.env.REDIS_URL!);
  await client.publish('streaming-chat', JSON.stringify({ content, username, id, userId, date }));
  client.quit();
  return new Response('OK');
}
