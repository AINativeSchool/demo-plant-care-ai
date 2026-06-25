# PlantCare AI — Requirements (v0.1)

**Goal:** An AI agent that identifies a plant from a user-supplied image and returns tailored care instructions.

**Status legend:** ✅ Done · 🚧 In progress · ⬜ Not started

---

## Core Features

- ✅ **Image upload** — User submits a photo of the plant via camera/gallery file picker or drag-and-drop.
- ✅ **Plant identification** — OpenAI GPT-4o vision detects the likely plant species from the image.
- ✅ **Care instructions** — Agent returns guidance on:
  - ✅ Water requirement (frequency & amount)
  - ✅ Sunlight requirement (level & hours)
  - ✅ Soil & fertilizer needs
  - ✅ Temperature & humidity range
- ✅ **Confidence & fallback** — Show identification confidence; ask for a clearer photo if confidence is low or the image is not a plant.
- ✅ **Follow-up Q&A** — User can ask plant-specific follow-up questions for the identified plant.
- ✅ Use Blend design system for the UI [https://blend.exe.xyz](https://blend.exe.xyz/)

## Non-Functional

- ✅ Supports common image formats (JPEG, PNG, HEIC).
- ✅ Graceful handling of non-plant / unclear images.

## Out of Scope (v0.1)

- ⬜ Disease/pest diagnosis.
- ⬜ Care reminders & notifications.
- ⬜ Multi-plant detection in one image.

## Decisions

- ✅ **AI vision/LLM provider:** OpenAI GPT-4o via the official OpenAI SDK.
- ✅ **Platform:** Web for v0.1.
- ✅ **Accounts/auth:** Not required for v0.1.
- ✅ **Persistence:** None for v0.1; conversation state stays in the current browser session.

