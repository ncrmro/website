import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  if (!prompt || typeof prompt !== 'string') {
    return new Response('Invalid prompt', { status: 400 });
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    prompt,
  });

  return result.toTextStreamResponse();
}
