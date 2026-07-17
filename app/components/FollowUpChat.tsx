"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ChatMessage, PlantIdentification } from "@/lib/types";

type FollowUpChatProps = {
  plant: PlantIdentification;
};

// buildSuggestedQuestions returns things you might say directly to your plant.
function buildSuggestedQuestions(): string[] {
  return [
    "How often do you want water?",
    "How much sun do you like?",
    "Are you safe around my pets?",
    "How will I know if you're unhappy?"
  ];
}

// FollowUpChat lets users keep a conversation going with their identified plant.
export function FollowUpChat({ plant }: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const suggestions = buildSuggestedQuestions();

  const askQuestion = async (trimmed: string) => {
    if (!trimmed || isSending) {
      return;
    }

    const priorMessages = messages;
    const nextMessages: ChatMessage[] = [...priorMessages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setError(null);
    setIsSending(true);

    try {
      const response = await apiFetch("/api/followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plant,
          messages: priorMessages,
          question: trimmed
        })
      });
      const payload = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error || "Your plant didn't catch that. Try again.");
      }

      setMessages([...nextMessages, { role: "assistant", content: payload.answer }]);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Your plant didn't catch that. Try again.";
      setError(message);
      setMessages(priorMessages);
    } finally {
      setIsSending(false);
    }
  };

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await askQuestion(question.trim());
  };

  return (
    <section className="chat-panel chat-panel--wide" aria-label={`Conversation with your ${plant.commonName}`}>
      <div>
        <h2 className="section-title">Keep talking</h2>
        <p className="muted">Ask your {plant.commonName} anything about day-to-day care.</p>
      </div>

      {!messages.length ? (
        <div className="suggested-questions-wrap">
          <p className="suggested-label">Say something to your plant</p>
          <div className="suggested-questions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="suggestion-chip"
                disabled={isSending}
                onClick={() => void askQuestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {messages.length ? (
        <div className="messages">
          {messages.map((message, index) => (
            <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
              <span className="chat-speaker">{message.role === "user" ? "You" : plant.commonName}</span>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="alert" role="alert">
          <strong>Your plant went quiet for a moment</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <form className="chat-form" onSubmit={submitQuestion}>
        <textarea
          className="textarea"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={`Ask your ${plant.commonName} something...`}
          aria-label={`Message to your ${plant.commonName}`}
        />
        <div className="actions">
          <button className="button primary" type="submit" disabled={!question.trim() || isSending}>
            {isSending ? "Your plant is typing..." : "Ask your plant"}
          </button>
        </div>
      </form>
    </section>
  );
}
