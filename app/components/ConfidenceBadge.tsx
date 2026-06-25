type ConfidenceBadgeProps = {
  confidence: number;
};

// ConfidenceBadge gives users a quick sense of identification certainty.
export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return <span className="badge">{Math.round(confidence * 100)}% sure that&apos;s me</span>;
}
