import type { PlantIdentification } from "@/lib/types";
import { ClimateIcon, SoilIcon, SunIcon, WaterIcon } from "./CareIcons";

type CareInstructionsProps = {
  plant: PlantIdentification;
};

const careItems = [
  { label: "Water", key: "water", Icon: WaterIcon },
  { label: "Sunlight", key: "sunlight", Icon: SunIcon },
  { label: "Soil & feed", key: "soil", Icon: SoilIcon },
  { label: "Climate", key: "temperatureHumidity", Icon: ClimateIcon }
] as const;

// CareInstructions renders a scannable care summary from structured AI output.
export function CareInstructions({ plant }: CareInstructionsProps) {
  return (
    <div className="care-summary">
      <p className="care-section-label">What I need from you</p>
      <div className="care-grid">
        {careItems.map(({ label, key, Icon }) => (
          <article className="care-item" key={key}>
            <div className="care-icon-wrap">
              <Icon className="care-icon" />
            </div>
            <div className="care-content">
              <h3 className="care-label">{label}</h3>
              <p className="care-detail">{plant[key]}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
