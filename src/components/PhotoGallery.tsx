"use client";

import { useState, useEffect } from "react";

interface PhotoGalleryProps {
  photos: string[];
  carName: string;
}

export default function PhotoGallery({ photos, carName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [validPhotos, setValidPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Probe all URLs to find which ones actually exist
    let cancelled = false;
    const checkPhotos = async () => {
      const results = await Promise.all(
        photos.map(
          (url) =>
            new Promise<string | null>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(url);
              img.onerror = () => resolve(null);
              img.src = url;
            })
        )
      );
      if (!cancelled) {
        setValidPhotos(results.filter((u): u is string => u !== null));
        setLoading(false);
      }
    };
    checkPhotos();
    return () => { cancelled = true; };
  }, [photos]);

  if (loading) {
    return (
      <div>
        <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 mb-4 animate-pulse" />
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (validPhotos.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const mainPhoto = validPhotos[selectedIndex] || validPhotos[0];

  return (
    <div>
      {/* Main image */}
      <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 mb-4 relative group">
        <img
          src={mainPhoto}
          alt={carName}
          className="w-full h-full object-cover"
        />
        {/* Navigation arrows */}
        {validPhotos.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev + 1) % validPhotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Photo counter */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {selectedIndex + 1} / {validPhotos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validPhotos.length > 1 && (
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {validPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all ${
                i === selectedIndex
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={photo}
                alt={`${carName} foto ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
