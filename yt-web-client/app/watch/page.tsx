"use client";

import { Suspense } from 'react';
import { useSearchParams } from "next/navigation";

function WatchContent() {
  const videoPrefix = "https://storage.googleapis.com/chanjbc-processed-video-bucket/";
  const videoSrc = useSearchParams().get("v");

  return (
    <div>
      <h1>Watch Page</h1>
      { videoSrc && <video controls src={`${videoPrefix}${videoSrc}`}/> }
    </div>
  );
}

export default function Watch() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
}