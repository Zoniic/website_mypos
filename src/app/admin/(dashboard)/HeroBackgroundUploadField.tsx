"use client";

import { useState } from "react";
import Image from "next/image";
import { isVideoUrl } from "@/lib/heroMedia";

export function HeroBackgroundUploadField({
  name,
  label,
  currentUrl,
  specHint,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  specHint: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewIsVideo(file.type.startsWith("video/"));
  }

  const displayUrl = previewUrl ?? currentUrl;
  const displayIsVideo = previewUrl ? previewIsVideo : Boolean(currentUrl && isVideoUrl(currentUrl));

  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <p className="mt-0.5 text-xs text-text-2">{specHint}</p>

      <div className="mt-2 flex items-start gap-4">
        <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-lg border border-border-strong bg-surface-0">
          {displayUrl ? (
            displayIsVideo ? (
              <video
                src={displayUrl}
                muted
                loop
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={displayUrl}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
                unoptimized={Boolean(previewUrl)}
              />
            )
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-text-2">
              No video/image yet
            </span>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            name={name}
            accept="video/mp4,image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="block w-full text-sm text-text-2 file:mr-3 file:rounded-lg file:border file:border-border-strong file:bg-surface-0 file:px-3 file:py-1.5 file:text-sm file:text-text-1"
          />
          {previewUrl && (
            <p className="mt-1 text-xs text-success">New file selected — preview above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
