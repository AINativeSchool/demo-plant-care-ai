declare module "heic2any" {
  type Heic2AnyOptions = {
    blob: Blob;
    toType?: string;
    quality?: number;
  };

  // heic2any converts iOS HEIC images into browser-friendly blobs.
  export default function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;
}
