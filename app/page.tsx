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
      const payload = (await response.json()) as PlantIdentification | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Your plant couldn't get through. Try again.");
      }

      setPlant(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Your plant couldn't get through. Try again.";
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
        <h1>Talk to your plant</h1>
        <p>Upload a photo, hear what it needs, and keep the conversation going.</p>
      </section>

      <div className="workspace">
        <div className="grid">
          <UploadZone image={image} isAnalyzing={isAnalyzing} onImageReady={identifyPlant} onReset={reset} />

          <div className="results-column">
            {error ? (
              <div className="alert" role="alert">
                <strong>Something got lost in translation</strong>
                <p>{error}</p>
              </div>
            ) : null}

            {isAnalyzing ? (
              <section className="card empty-state" aria-live="polite">
                <span className="spinner" aria-hidden="true" />
                <p>Your plant is waking up and getting ready to talk...</p>
              </section>
            ) : null}

            {!isAnalyzing && !plant && !error ? (
              <section className="card empty-state">
                <p>Your plant will introduce itself here once you share a photo.</p>
              </section>
            ) : null}

            {!isAnalyzing && needsFallback ? <FallbackBanner reason={plant?.fallbackReason} /> : null}

            {!isAnalyzing && hasConfidentPlant && plant ? <ResultCard plant={plant} image={image} /> : null}
          </div>
        </div>

        {!isAnalyzing && hasConfidentPlant && plant ? (
          <FollowUpChat key={`${plant.commonName}-${plant.species}`} plant={plant} />
        ) : null}
      </div>
    </>
  );
}
