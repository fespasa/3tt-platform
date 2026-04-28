"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
  className?: string;
}

export default function VideoPlayer({ src, onTimeUpdate, onEnded, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const lastReportedRef = useRef(0);

  // Report watched_seconds every 30s
  const reportTime = useCallback(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;
    const currentTime = Math.floor(video.currentTime);
    if (currentTime - lastReportedRef.current >= 30) {
      lastReportedRef.current = currentTime;
      onTimeUpdate(currentTime);
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHLS = src.endsWith(".m3u8") || src.includes(".m3u8?");

    if (isHLS && !video.canPlayType("application/vnd.apple.mpegurl")) {
      // Use HLS.js for browsers without native HLS support
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        const hls = new Hls({ startLevel: -1 });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    } else {
      // Native playback (MP4 or native HLS like Safari)
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Report time on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && onTimeUpdate) {
        onTimeUpdate(Math.floor(video.currentTime));
      }
    };
  }, [onTimeUpdate]);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const cycleSpeed = () => {
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        playsInline
        onTimeUpdate={reportTime}
        onEnded={() => {
          if (onTimeUpdate && videoRef.current) {
            onTimeUpdate(Math.floor(videoRef.current.currentTime));
          }
          onEnded?.();
        }}
      />
      <button
        onClick={cycleSpeed}
        className="absolute bottom-14 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded hover:bg-black/90 transition-colors"
        title="Cambiar velocidad"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
