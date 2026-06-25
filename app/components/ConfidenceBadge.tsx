type ConfidenceBadgeProps = {
  confidence: number;
};

// ConfidenceBadge gives users a quick sense of identification certainty.
export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return <span className="badge">{Math.round(confidence * 100)}% confidence</span>;
}
