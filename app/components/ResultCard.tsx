import type { PlantIdentification } from "@/lib/types";
import { CareInstructions } from "./CareInstructions";
import { ConfidenceBadge } from "./ConfidenceBadge";

type ResultCardProps = {
  plant: PlantIdentification;
};

// ResultCard presents a confident plant identification and care plan.
export function ResultCard({ plant }: ResultCardProps) {
  return (
    <section className="card" aria-label="Plant identification result">
      <div className="plant-header">
        <div>
          <h2 className="plant-name">{plant.commonName}</h2>
          <p className="scientific">{plant.species}</p>
        </div>
        <ConfidenceBadge confidence={plant.confidence} />
      </div>
      <CareInstructions plant={plant} />
    </section>
  );
}
