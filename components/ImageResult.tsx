import React from 'react';
import { GeneratedImage } from '../types';

interface ImageResultProps {
  image: GeneratedImage;
}

export const ImageResult: React.FC<ImageResultProps> = ({ image }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `ad-genius-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="block animate-fade-in">
      <div className="relative border-2 border-white mb-4">
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full h-auto block"
          loading="lazy"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 font-mono text-sm">
        <div className="flex-1 space-y-2">
          <div className="uppercase text-xs tracking-wider border border-white inline-block px-1 mb-1">
            {image.aspectRatio}
          </div>
          <p className="text-white uppercase leading-relaxed break-words text-xs sm:text-sm">
            {image.prompt}
          </p>
        </div>
        
        <button
          onClick={handleDownload}
          className="shrink-0 w-full sm:w-auto border border-white px-4 py-3 sm:py-2 hover:bg-white hover:text-black transition-colors uppercase text-xs font-bold tracking-wider text-center"
        >
          Download
        </button>
      </div>
    </div>
  );
};