import type { PlantIdentification } from "@/lib/types";

type CareInstructionsProps = {
  plant: PlantIdentification;
};

const careFields = [
  ["Water", "water"],
  ["Sunlight", "sunlight"],
  ["Soil & fertilizer", "soil"],
  ["Temperature & humidity", "temperatureHumidity"]
] as const;

// CareInstructions maps structured AI output into the required care categories.
export function CareInstructions({ plant }: CareInstructionsProps) {
  return (
    <div className="care-grid">
      {careFields.map(([label, key]) => (
        <article className="care-card" key={key}>
          <h3>{label}</h3>
          <p>{plant[key]}</p>
        </article>
      ))}
    </div>
  );
}
