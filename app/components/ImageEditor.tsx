'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, SlidersHorizontal, Image as ImageIcon, RotateCw, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

export default function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hueRotate, setHueRotate] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop'>('adjust');
  
  // Create a canvas object for rendering the final result
  const getProcessedImage = () => {
    if (!imgRef.current) return;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Determine dimensions (cropped or full)
    let outputWidth = image.naturalWidth;
    let outputHeight = image.naturalHeight;
    let srcX = 0;
    let srcY = 0;
    
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      outputWidth = completedCrop.width * scaleX;
      outputHeight = completedCrop.height * scaleY;
      srcX = completedCrop.x * scaleX;
      srcY = completedCrop.y * scaleY;
    }
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px)`;
    
    // Draw image
    ctx.drawImage(
      image,
      srcX, srcY, outputWidth, outputHeight, // Source rectangle
      0, 0, outputWidth, outputHeight // Destination rectangle
    );
    
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    const processedUrl = getProcessedImage();
    if (processedUrl) {
      onSave(processedUrl);
    }
  };
  
  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px)`
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 lg:p-8"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl h-full max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl"
      >
        {/* Editor Area (Left/Top) */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/50 p-4 min-h-[50vh]">
          {activeTab === 'crop' ? (
            <ReactCrop 
              crop={crop} 
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              className="max-h-full max-w-full flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt="Edit preview" 
                style={filterStyle}
                className="max-h-[70vh] w-auto object-contain mx-auto"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Edit preview" 
              style={filterStyle}
              className="max-h-full max-w-full object-contain"
              crossOrigin="anonymous"
            />
          )}
        </div>
        
        {/* Controls Sidebar */}
        <div className="w-full lg:w-80 bg-[#0A0A0A] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-serif italic text-lg text-white">Editor</h3>
            <button 
              onClick={onCancel}
              className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'adjust' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Adjust
            </button>
            <button 
              onClick={() => setActiveTab('crop')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'crop' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Crop
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 no-scrollbar">
            {activeTab === 'adjust' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
                
                {/* Lighting Section */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase border-b border-white/10 pb-2">Lighting</h4>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Brightness</label>
                      <span className="text-[10px] font-mono text-slate-500">{brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={brightness} 
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Contrast</label>
                      <span className="text-[10px] font-mono text-slate-500">{contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={contrast} 
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>
                </div>

                {/* Color Section */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase border-b border-white/10 pb-2">Color</h4>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Saturation</label>
                      <span className="text-[10px] font-mono text-slate-500">{saturation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={saturation} 
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Hue Balance</label>
                      <span className="text-[10px] font-mono text-slate-500">{hueRotate}°</span>
                    </div>
                    <input 
                      type="range" min="0" max="360" value={hueRotate} 
                      onChange={(e) => setHueRotate(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Temperature (Sepia)</label>
                      <span className="text-[10px] font-mono text-slate-500">{sepia}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={sepia} 
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Grayscale</label>
                      <span className="text-[10px] font-mono text-slate-500">{grayscale}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={grayscale} 
                      onChange={(e) => setGrayscale(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>
                </div>

                {/* Detail Section */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase border-b border-white/10 pb-2">Detail</h4>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Blur</label>
                      <span className="text-[10px] font-mono text-slate-500">{blur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="20" value={blur} 
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-white/5 h-1 rounded-full appearance-none outline-none"
                    />
                  </div>
                </div>
                
                <div className="pt-4 mt-2 border-t border-white/5 flex gap-2">
                  <button 
                    onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setHueRotate(0); setSepia(0); setGrayscale(0); setBlur(0); }}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5 rounded hover:bg-white/10 transition-colors"
                  >
                    Reset Adjustments
                  </button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'crop' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-white/5 p-4 rounded border border-white/10 leading-relaxed">
                  Drag on the image to create a crop selection. Adjust the corners to frame exactly what you need.
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setCrop(undefined); setCompletedCrop(undefined); }}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5 rounded hover:bg-white/10 transition-colors"
                  >
                    Clear Crop
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="p-6 border-t border-white/10 bg-[#080808]">
            <button 
              onClick={handleSave}
              className="w-full py-4 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-black text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-[0.98] outline-none"
            >
              <Check className="w-4 h-4" />
              Apply Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
