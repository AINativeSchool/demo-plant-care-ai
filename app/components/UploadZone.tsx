"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type UploadZoneProps = {
  image: string | null;
  isAnalyzing: boolean;
  onImageReady: (image: string) => void;
  onReset: () => void;
};

const maxDimension = 1600;

// isHeicFile detects iOS HEIC uploads that need browser-side conversion.
function isHeicFile(file: File) {
  return file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}

// convertHeicToJpeg normalizes HEIC images before preview and upload.
async function convertHeicToJpeg(file: File) {
  if (!isHeicFile(file)) {
    return file;
  }

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.86
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;

  return new File([blob], file.name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
}

// downscaleImage keeps upload payloads modest for faster vision requests.
async function downscaleImage(file: File) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read this image."));
      img.src = imageUrl;
    });

    const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.round(image.width * ratio);
    const height = Math.round(image.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image processing is not available in this browser.");
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

// UploadZone handles camera/gallery uploads and prepares images for analysis.
export function UploadZone({ image, isAnalyzing, onImageReady, onReset }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/") && !isHeicFile(file)) {
      setError("Please choose a JPEG, PNG, or HEIC image.");
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);
      const normalized = await convertHeicToJpeg(file);
      const dataUrl = await downscaleImage(normalized);
      onImageReady(dataUrl);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not process this image.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="upload-zone" aria-label="Plant photo upload">
      <div
        className={`upload-drop ${isDragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {image ? (
          <img className="preview" src={image} alt="Selected plant preview" />
        ) : (
          <div>
            <p className="section-title">Add a plant photo</p>
            <p className="muted">Use a clear image of a single plant from your camera or gallery.</p>
          </div>
        )}
      </div>

      {error ? (
        <div className="alert" role="alert">
          <strong>Upload issue</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <input
        ref={inputRef}
        className="upload-input"
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/*"
        capture="environment"
        onChange={handleInput}
      />

      <div className="actions">
        <button className="button primary" type="button" onClick={() => inputRef.current?.click()}>
          {image ? "Choose another photo" : "Choose photo"}
        </button>
        {image ? (
          <button className="button" type="button" onClick={onReset} disabled={isAnalyzing || isProcessing}>
            Reset
          </button>
        ) : null}
        {(isProcessing || isAnalyzing) && (
          <span className="badge" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            {isProcessing ? "Preparing image" : "Analyzing plant"}
          </span>
        )}
      </div>
    </section>
  );
}
