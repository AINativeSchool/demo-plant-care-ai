type FallbackBannerProps = {
  reason?: string;
};

// FallbackBanner asks for a clearer image when the model is unsure.
export function FallbackBanner({ reason }: FallbackBannerProps) {
  return (
    <div className="alert" role="status">
      <strong>Try a clearer plant photo</strong>
      <p>
        {reason ||
          "I could not identify a single plant confidently. Use a brighter, closer image with the leaves clearly visible."}
      </p>
    </div>
  );
}
