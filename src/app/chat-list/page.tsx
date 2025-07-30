"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";

export default function ChatListPage() {
  const searchParams = useSearchParams();
  const selectedSessionId = Number(searchParams.get("id"));

  const { data: sessions, isLoading, isError } = api.chat.getChatSessions.useQuery();

  if (isLoading) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">Loading chat sessions...</div>;
  }

  if (isError || !sessions) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">Error loading chat sessions.</div>;
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Chat <span className="text-[hsl(280,100%,70%)]">Sessions</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Your Sessions</h2>
            <ul className="list-disc pl-5">
              {sessions.map((sessionItem) => (
                <li key={sessionItem.id} className="mb-2">
                  <Link
                    href={`/chat-list?id=${sessionItem.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    Session {new Date(sessionItem.createdAt).toLocaleString()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            {selectedSession ? (
              <>
                <h2 className="text-2xl font-bold">
                  Chat Thread for Session{" "}
                  {new Date(selectedSession.createdAt).toLocaleString()}
                </h2>
                <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-800 p-4">
                  {selectedSession.messages.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`inline-block rounded-lg p-2 ${msg.role === "user" ? "bg-blue-600" : "bg-gray-700"}`}
                      >
                        <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
                        {msg.content}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Select a session to view the chat thread.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
