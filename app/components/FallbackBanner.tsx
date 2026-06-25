type FallbackBannerProps = {
  reason?: string;
};

// FallbackBanner asks for a clearer image when the model is unsure.
export function FallbackBanner({ reason }: FallbackBannerProps) {
  return (
    <div className="alert" role="status">
      <strong>Your plant couldn&apos;t quite say hello</strong>
      <p>
        {reason ||
          "I couldn't make myself out clearly. Try a brighter, closer photo with my leaves in focus."}
      </p>
    </div>
  );
}
