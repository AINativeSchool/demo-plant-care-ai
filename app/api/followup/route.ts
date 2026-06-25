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
            "You are PlantCare AI. Answer concise plant-care follow-up questions for the identified plant. Stay within routine care guidance. If asked about disease, pests, medical safety, toxicity emergencies, or reminders, explain that it is outside v0.1 scope and give a safe next step."
        },
        {
          role: "user",
          content: `Plant context:\nCommon name: ${body.plant.commonName}\nScientific name: ${body.plant.species}\nWater: ${body.plant.water}\nSunlight: ${body.plant.sunlight}\nSoil/fertilizer: ${body.plant.soil}\nTemperature/humidity: ${body.plant.temperatureHumidity}`
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
