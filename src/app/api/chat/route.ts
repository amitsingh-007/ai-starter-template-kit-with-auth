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

  const result = streamText({
    model: openai("gpt-4.1-nano"),
    system: "You are a helpful assistant.",
    messages,
  });

  const response = result.toDataStreamResponse();
  const [stream1, stream2] = response.body!.tee();

  // Asynchronously save the full AI response to the database after the stream completes
  (async () => {
    let aiResponse = "";
    const reader = stream2.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const decodedChunk = new TextDecoder().decode(value);
      const lines = decodedChunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('0:')) {
          try {
            const parsedContent = JSON.parse(line.substring(2));
            aiResponse += parsedContent;
          } catch (e) {
            console.error("Error parsing AI response chunk for DB save:", e, line);
            // Fallback to just appending the raw content if parsing fails
            aiResponse += line.substring(2);
          }
        }
      }
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

  const responseInit: ResponseInit = {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  };

  return new Response(stream1, responseInit);
}
