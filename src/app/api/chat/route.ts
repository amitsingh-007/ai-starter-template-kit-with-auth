import { OpenAI } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText } from 'ai';
 
export const runtime = 'edge';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  const result = await streamText({
    model: openai.chat('gpt-4.1-nano'),
    messages,
  });
 
  return new StreamingTextResponse(result.toAIStream());
}
