export type PlantIdentification = {
  isPlant: boolean;
  species: string;
  commonName: string;
  confidence: number;
  water: string;
  sunlight: string;
  soil: string;
  temperatureHumidity: string;
  fallbackReason: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
