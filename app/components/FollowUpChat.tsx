"use client";

import { FormEvent, useState } from "react";
import type { ChatMessage, PlantIdentification } from "@/lib/types";

type FollowUpChatProps = {
  plant: PlantIdentification;
};

// FollowUpChat keeps plant-specific Q&A in local state for the current session.
export function FollowUpChat({ plant }: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plant,
          messages,
          question: trimmed
        })
      });
      const payload = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error || "Could not answer that question.");
      }

      setMessages([...nextMessages, { role: "assistant", content: payload.answer }]);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not answer that question.";
      setError(message);
      setMessages(messages);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="chat-panel" aria-label="Follow-up plant questions">
      <div>
        <h2 className="section-title">Ask a follow-up</h2>
        <p className="muted">Questions stay focused on care for this {plant.commonName}.</p>
      </div>

      {messages.length ? (
        <div className="messages">
          {messages.map((message, index) => (
            <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="alert" role="alert">
          <strong>Chat issue</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <form className="chat-form" onSubmit={submitQuestion}>
        <textarea
          className="textarea"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="For example: how do I know when it needs water?"
          aria-label="Follow-up question"
        />
        <div className="actions">
          <button className="button primary" type="submit" disabled={!question.trim() || isSending}>
            {isSending ? "Thinking" : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
