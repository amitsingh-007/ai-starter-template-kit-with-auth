import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "@/server/db";
import { chatSessions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  getChatSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const sessions = await db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, userId),
      orderBy: (chatSessions, { desc }) => desc(chatSessions.createdAt),
    });
    return sessions;
  }),
});
