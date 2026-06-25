"use client";

import { useState } from "react";
import { FallbackBanner } from "./components/FallbackBanner";
import { FollowUpChat } from "./components/FollowUpChat";
import { ResultCard } from "./components/ResultCard";
import { UploadZone } from "./components/UploadZone";
import type { PlantIdentification } from "@/lib/types";

// HomePage coordinates upload, AI identification, fallback handling, and follow-up chat.
export default function HomePage() {
  const [image, setImage] = useState<string | null>(null);
  const [plant, setPlant] = useState<PlantIdentification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const reset = () => {
    setImage(null);
    setPlant(null);
    setError(null);
    setIsAnalyzing(false);
  };

  const identifyPlant = async (nextImage: string) => {
    setImage(nextImage);
    setPlant(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: nextImage })
      });
      const payload = (await response.json()) as PlantIdentification | { error?: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Could not identify this plant.");
      }

      setPlant(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not identify this plant.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasConfidentPlant = Boolean(plant?.isPlant && plant.confidence >= 0.5);
  const needsFallback = Boolean(plant && !hasConfidentPlant);

  return (
    <>
      <section className="hero">
        <h1>Identify a plant. Care for it calmly.</h1>
        <p>
          Upload a clear photo and PlantCare AI will suggest the likely species, confidence, and practical care
          instructions for water, light, soil, and climate.
        </p>
      </section>

      <div className="grid">
        <UploadZone image={image} isAnalyzing={isAnalyzing} onImageReady={identifyPlant} onReset={reset} />

        <div>
          {error ? (
            <div className="alert" role="alert">
              <strong>Analysis issue</strong>
              <p>{error}</p>
            </div>
          ) : null}

          {isAnalyzing ? (
            <section className="card empty-state" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <p>Looking closely at leaves, shape, and care clues.</p>
            </section>
          ) : null}

          {!isAnalyzing && !plant && !error ? (
            <section className="card empty-state">
              <p>Results will appear here after you choose a photo.</p>
            </section>
          ) : null}

          {!isAnalyzing && needsFallback ? <FallbackBanner reason={plant?.fallbackReason} /> : null}

          {!isAnalyzing && hasConfidentPlant && plant ? (
            <>
              <ResultCard plant={plant} />
              <FollowUpChat key={`${plant.commonName}-${plant.species}`} plant={plant} />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
