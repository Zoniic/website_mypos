"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageUploadField({
  name,
  label,
  currentUrl,
  ratio = "1/1",
  specHint,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  ratio?: "1/1" | "4/3" | "16/9" | "5/1";
  specHint: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const ratioClass =
    ratio === "1/1"
      ? "aspect-square"
      : ratio === "4/3"
        ? "aspect-[4/3]"
        : ratio === "5/1"
          ? "aspect-[5/1] max-w-sm"
          : "aspect-[16/9]";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <p className="mt-0.5 text-xs text-text-2">{specHint}</p>

      <div className="mt-2 flex items-start gap-4">
        <div
          className={`relative w-32 shrink-0 overflow-hidden rounded-lg border border-border-strong bg-surface-0 ${ratioClass}`}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={Boolean(previewUrl)}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-text-2">
              No image yet
            </span>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="block w-full text-sm text-text-2 file:mr-3 file:rounded-lg file:border file:border-border-strong file:bg-surface-0 file:px-3 file:py-1.5 file:text-sm file:text-text-1"
          />
          {previewUrl && (
            <p className="mt-1 text-xs text-success">New image selected — preview above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
