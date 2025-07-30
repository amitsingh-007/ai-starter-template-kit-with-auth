import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/server/db";
import { chatSessions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Save the initial user message
  const newChatSession = await db
    .insert(chatSessions)
    .values({
      userId: userId,
      messages: messages,
    })
    .returning();

  const result = await streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  const [stream1, stream2] = result.textStream.tee();

  // Asynchronously save the full AI response to the database after the stream completes
  (async () => {
    let aiResponse = "";
    const reader = stream2.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiResponse += value;
    }

    if (newChatSession?.[0]?.id) {
      await db
        .update(chatSessions)
        .set({
          messages: [...messages, { role: "assistant", content: aiResponse }],
        })
        .where(eq(chatSessions.id, newChatSession[0].id));
    }
  })().catch((error) => {
    console.error("Error saving AI response to DB:", error);
    // Handle error, e.g., log it or send a notification
  });

  return new Response(stream1, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
