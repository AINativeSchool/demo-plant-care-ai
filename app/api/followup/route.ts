import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import type { ChatMessage, PlantIdentification } from "@/lib/types";

type FollowupRequest = {
  plant?: PlantIdentification;
  messages?: ChatMessage[];
  question?: string;
};

// sanitizeMessages keeps the follow-up prompt focused and bounded.
function sanitizeMessages(messages: ChatMessage[] = []) {
  return messages.slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1200)
  }));
}

// POST answers plant-specific follow-up questions for an identified plant.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FollowupRequest;
    const question = body.question?.trim();

    if (!body.plant?.isPlant || !body.plant.commonName || !question) {
      return NextResponse.json(
        { error: "A valid plant identification and question are required." },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            `You are a ${body.plant.commonName} (${body.plant.species}) speaking directly to your owner. Answer follow-up care questions in first person, warmly and concisely, as if continuing a conversation. Stay within routine care guidance. If asked about disease, pests, medical safety, toxicity emergencies, or reminders, explain that you can't help with that yet and suggest a safe next step.`
        },
        {
          role: "user",
          content: `Here's what I already told my owner about my care:\nCommon name: ${body.plant.commonName}\nScientific name: ${body.plant.species}\nWater: ${body.plant.water}\nSunlight: ${body.plant.sunlight}\nSoil/fertilizer: ${body.plant.soil}\nTemperature/humidity: ${body.plant.temperatureHumidity}`
        },
        ...sanitizeMessages(body.messages).map((message) => ({
          role: message.role,
          content: message.content
        })),
        {
          role: "user" as const,
          content: question
        }
      ]
    });

    const answer = completion.choices[0]?.message.content?.trim();

    if (!answer) {
      return NextResponse.json({ error: "No answer returned." }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer the question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
