import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import type { PlantIdentification } from "@/lib/types";

const identificationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isPlant: {
      type: "boolean",
      description: "Whether the image clearly contains a plant."
    },
    species: {
      type: "string",
      description: "Likely scientific species name, or an empty string when not identifiable."
    },
    commonName: {
      type: "string",
      description: "Common plant name, or an empty string when not identifiable."
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence from 0 to 1."
    },
    water: {
      type: "string",
      description: "Water frequency and amount guidance."
    },
    sunlight: {
      type: "string",
      description: "Sunlight level and daily hours guidance."
    },
    soil: {
      type: "string",
      description: "Soil and fertilizer guidance."
    },
    temperatureHumidity: {
      type: "string",
      description: "Temperature and humidity range guidance."
    },
    fallbackReason: {
      type: "string",
      description: "Short explanation when the image is unclear or not a plant; empty when confident."
    }
  },
  required: [
    "isPlant",
    "species",
    "commonName",
    "confidence",
    "water",
    "sunlight",
    "soil",
    "temperatureHumidity",
    "fallbackReason"
  ]
} as const;

// parseIdentification safely converts the model's JSON text into the app contract.
function parseIdentification(content: string): PlantIdentification {
  const parsed = JSON.parse(content) as PlantIdentification;

  return {
    ...parsed,
    confidence: Math.min(1, Math.max(0, parsed.confidence))
  };
}

// POST identifies a plant image and returns structured care guidance.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { image?: string };

    if (!body.image || !body.image.startsWith("data:image/")) {
      return NextResponse.json({ error: "A valid image data URL is required." }, { status: 400 });
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "plant_identification",
          strict: true,
          schema: identificationSchema
        }
      },
      messages: [
        {
          role: "system",
          content:
            "You are a plant speaking directly to your owner. Identify yourself from the image as one common house or garden plant. Write water, sunlight, soil, and temperatureHumidity guidance in first person, as if telling your owner what you need. Keep each field concise and practical. If the image is unclear, low quality, not a plant, or shows multiple plants where one cannot be chosen, set isPlant false or confidence below 0.5 and explain fallbackReason in first person. Do not diagnose disease or pests."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this photo and introduce yourself. Tell your owner what you need for water, sunlight, soil/fertilizer, and temperature/humidity."
            },
            {
              type: "image_url",
              image_url: {
                url: body.image,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const content = completion.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json({ error: "No identification returned." }, { status: 502 });
    }

    return NextResponse.json(parseIdentification(content));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to identify the plant.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
