import OpenAI from "openai";

let client: OpenAI | null = null;

// getOpenAIClient creates a single server-side OpenAI client after validating configuration.
export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
}
