import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/server/db';
import { chatSessions } from '@/server/db/schema';import { eq } from 'drizzle-orm';
import { getServerAuthSession } from '@/server/auth';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const session = await getServerAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Save the initial user message
  const newChatSession = await db.insert(chatSessions).values({
    userId: userId,
    messages: messages,
  }).returning();

  const result = streamText({
    model: openai('gpt-4.1-nano'),
    system: 'You are a helpful assistant.',
    messages,
  });

  // Update the chat session with the AI's response
  const stream = result.toDataStreamResponse();
  const reader = stream.body?.getReader();
  let aiResponse = '';

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiResponse += new TextDecoder().decode(value);
    }
  }

  await db.update(chatSessions).set({
    messages: [...messages, { role: 'assistant', content: aiResponse }],
  }).where(eq(chatSessions.id, newChatSession[0].id));

  return stream;
}