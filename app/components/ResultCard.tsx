import type { PlantIdentification } from "@/lib/types";
import { CareInstructions } from "./CareInstructions";
import { ConfidenceBadge } from "./ConfidenceBadge";

type ResultCardProps = {
  plant: PlantIdentification;
  image?: string | null;
};

// ResultCard presents a confident plant ID and a quick visual care summary.
export function ResultCard({ plant, image }: ResultCardProps) {
  return (
    <section className="card result-card" aria-label={`${plant.commonName} introduces itself`}>
      <div className="result-hero">
        {image ? (
          <img src={image} alt="" className="result-photo" />
        ) : (
          <div className="result-photo result-photo--placeholder" aria-hidden="true" />
        )}
        <div className="result-identity">
          <ConfidenceBadge confidence={plant.confidence} />
          <h2 className="plant-name">{plant.commonName}</h2>
          <p className="scientific">{plant.species}</p>
          <p className="plant-greeting">Hi. Here&apos;s how you can take good care of me.</p>
        </div>
      </div>
      <CareInstructions plant={plant} />
    </section>
  );
}
