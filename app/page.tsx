'use client';

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Image as ImageIcon, Upload, Loader2, Download, Copy, AlertCircle, Settings2, Link2, MonitorPlay, Edit2, Bookmark, Trash2, LayoutGrid, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ImageEditor from './components/ImageEditor';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define the asset generation result
interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  style: string;
  quality: string;
  createdAt: number;
  isSaved?: boolean;
}

export default function OnyxForge() {
  // Input State
  const [prompt, setPrompt] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('Standard');
  const [style, setStyle] = useState('Minimalist');
  const [variations, setVariations] = useState(1);
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [bokeh, setBokeh] = useState('None');
  const [lighting, setLighting] = useState('None');
  const [lensSize, setLensSize] = useState('Default');
  const [cameraAngle, setCameraAngle] = useState('Default');
  const [filmEffect, setFilmEffect] = useState('None');
  const [removeBackground, setRemoveBackground] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Status State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Output State
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'feed' | 'saved'>('feed');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const QUALITIES = ['Standard', 'High', 'Ultra'];
  const STYLES = ['Cyberpunk', 'Minimalist', 'Luxe', 'Retro', 'Industrial', 'Raw', 'None'];
  const MODELS = ['gemini-2.5-flash-image', 'imagen-3.0-generate-002', 'gemini-3.0-pro-image'];
  const BOKEH_OPTIONS = ['None', 'Soft', 'Strong', 'Macro'];
  const LIGHTING_OPTIONS = ['None', 'Front', 'Backlight', 'Side', 'Top', 'Rim', 'Cinematic'];
  const LENS_SIZES = ['Default', '25mm', '35mm', '50mm', '85mm', '115mm', '200mm', '300mm'];
  const CAMERA_ANGLES = ['Default', 'Eye-Level', 'Low Angle', 'High Angle', 'Top-Down', 'Dutch Angle'];
  const FILM_EFFECTS = ['None', '35mm Film Grain', 'Vintage', 'Cinematic', 'Polaroid', 'Monochrome'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: "easeOut" } }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const autoEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsEnhancing(true);
    setError(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not found");
      
      const ai = new GoogleGenAI({ apiKey });
      
      const enhanceContext = productUrl ? ` Product Context/URL info provided by user: ${productUrl}.` : '';
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert prompt engineer for AI image generation. Rewrite the following user description into a highly detailed, descriptive prompt suitable for a product advertisement banner. Make it visceral, visually stunning, specifying lighting, camera angle, and background context. DO NOT include any conversational filler (e.g., "Here is the prompt:"), just return the raw prompt text.${enhanceContext} Original description: ${prompt}`,
      });
      
      if (response.text) {
        setPrompt(response.text.trim());
      }
    } catch (err: any) {
      setError("Failed to enhance prompt: " + err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const constructFinalPrompt = () => {
    let finalPrompt = prompt;
    
    const stylePrompts: Record<string, string> = {
      Cyberpunk: "Cyberpunk aesthetic, neon lighting, dark futuristic environment, highly detailed, sci-fi vibes, volumetric lighting.",
      Minimalist: "Minimalist, clean background, modern aesthetic, simple, elegant, negative space.",
      Luxe: "Luxury aesthetic, high-end, premium soft lighting, elegant, expensive feel, sophisticated.",
      Retro: "Retro style, vintage aesthetic, nostalgic, film grain, 80s or 90s advertising style.",
      Industrial: "Industrial design, metallic textures, concrete, dramatic lighting, raw materials, studio photography.",
      Raw: "Raw photography, highly realistic, unedited look, natural lighting, documentary style, 35mm lens.",
      None: "",
    };

    const qualityPrompts: Record<string, string> = {
      Standard: "Professional product photography, sharp focus.",
      High: "High quality, 4k resolution, extremely detailed, masterfully crafted.",
      Ultra: "Masterpiece, ultra-high definition, 8k, photorealistic, cinematic lighting, award-winning photography, flawless rendering."
    };

    let modifiers = [];
    if (style && style !== 'None') modifiers.push(stylePrompts[style]);
    if (quality) modifiers.push(qualityPrompts[quality]);
    
    if (bokeh && bokeh !== 'None') {
      const bokehPrompts: Record<string, string> = {
        Soft: "Soft bokeh background, shallow depth of field, blurred background.",
        Strong: "Strong bokeh, extreme shallow depth of field, creamy background blur.",
        Macro: "Macro photography, extreme close up, heavy bokeh.",
      };
      modifiers.push(bokehPrompts[bokeh]);
    }

    if (lighting && lighting !== 'None') {
      modifiers.push(`${lighting.toLowerCase()} lighting.`);
    }

    if (lensSize && lensSize !== 'Default') {
      modifiers.push(`shot on ${lensSize} lens.`);
    }
    
    if (cameraAngle && cameraAngle !== 'Default') {
      modifiers.push(`${cameraAngle.toLowerCase()} camera angle.`);
    }

    if (filmEffect && filmEffect !== 'None') {
      modifiers.push(filmEffect + " aesthetics.");
    }

    if (removeBackground) modifiers.push("Solid white background, perfectly isolated subject, easy to extract.");
    
    // Check if prompt already seems to contain extensive details
    if (modifiers.length > 0) {
      finalPrompt += ` . ${modifiers.join(' ')}`;
    }

    if (logoFile) {
       finalPrompt += ". Seamlessly incorporate and feature the provided brand logo in the scene, placing it tastefully.";
    }

    return finalPrompt;
  };

  const getBase64Pattern = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    return {
      mimeType: parts[0].match(/:(.*?);/)?.[1] || 'image/png',
      data: parts[1]
    };
  };

  const generateAssets = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not found");
      
      const ai = new GoogleGenAI({ apiKey });
      const finalPrompt = constructFinalPrompt();
      
      // Determine parts
      const parts: any[] = [{ text: finalPrompt }];
      
      if (logoPreview) {
         const logoData = getBase64Pattern(logoPreview);
         parts.push({
           inlineData: {
             data: logoData.data,
             mimeType: logoData.mimeType,
           }
         });
      }
      
      // Generate multiple variations in parallel
      const generatePromises = Array.from({ length: variations }).map(() => {
        return ai.models.generateContent({
          model: model,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        });
      });
      
      const responses = await Promise.all(generatePromises);
      
      const newAssets: GeneratedAsset[] = [];
      
      responses.forEach((response) => {
        // Extract the generated image
        response.candidates?.[0]?.content?.parts?.forEach((part) => {
          if (part.inlineData) {
            newAssets.push({
              id: Math.random().toString(36).substring(7),
              url: `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`,
              prompt: finalPrompt,
              aspectRatio,
              style,
              quality,
              createdAt: Date.now(),
            });
          }
        });
      });
      
      if (newAssets.length === 0) {
         throw new Error("No images were generated. This might be due to safety filters.");
      }

      setAssets((prev) => [...newAssets, ...prev]);
      
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429')) {
         setError("Rate limit exceeded. Please wait a moment and try again.");
      } else if (err.message?.includes('finishReason')) {
         setError("Generation blocked by safety filters. Please try modifying your prompt.");
      } else {
         setError("Failed to generate image: " + err.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (asset: GeneratedAsset) => {
    const a = document.createElement('a');
    a.href = asset.url;
    a.download = `onyx-forge-${asset.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleEditorSave = (assetId: string, newUrl: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, url: newUrl } : a));
    setEditingAssetId(null);
  };

  const toggleSaveAsset = (assetId: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, isSaved: !a.isSaved } : a));
  };

  const deleteAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#0A0A0A] text-slate-300 font-sans">
      
      {/* Left Sidebar - Controls */}
      <div className="w-full lg:w-[450px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#080808] flex flex-col z-20 h-auto lg:h-screen lg:sticky top-0 overflow-visible lg:overflow-y-auto no-scrollbar shadow-2xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-6 pb-2 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#080808]/80 backdrop-blur-md z-20"
        >
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-sm bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] rotate-45 transition-transform hover:scale-110">
                <Wand2 className="w-4 h-4 text-black -rotate-45" />
             </div>
             <h1 className="text-xl font-serif italic text-white tracking-tight">Onyx Forge</h1>
          </div>
          <Settings2 className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 flex flex-col gap-8 flex-grow"
        >
          {/* Model Selection */}
          <motion.section variants={itemVariants} className="flex flex-col gap-3">
             <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Engine</label>
             <div className="relative group">
               <select 
                 value={model} 
                 onChange={(e) => setModel(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
               >
                 {MODELS.map(m => <option key={m} value={m} className="bg-[#0A0A0A]">{m}</option>)}
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </div>
             </div>
          </motion.section>

          {/* Prompt Section */}
          <motion.section variants={itemVariants} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Concept & Description</label>
              <button 
                onClick={autoEnhancePrompt}
                disabled={isEnhancing || !prompt}
                className="text-[10px] uppercase tracking-widest flex items-center gap-1.5 font-bold text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AUTO-ENHANCE
              </button>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A sleek running shoe hovering over a neon-lit street, rain ripples on the ground..."
              className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded px-3 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#0c0c0c] hover:border-white/20 transition-all resize-y shadow-inner focus:shadow-[0_0_15px_rgba(249,115,22,0.1)] focus:ring-1 focus:ring-orange-500/50"
            />
          </motion.section>

          {/* Reference URL */}
          <motion.section variants={itemVariants} className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Product Resonance (Optional)</label>
            <div className="relative group">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://your-product.com"
                className="w-full bg-white/5 border border-white/10 rounded pl-9 pr-3 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#0c0c0c] hover:border-white/20 transition-all shadow-inner focus:shadow-[0_0_15px_rgba(249,115,22,0.1)] focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </motion.section>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-6">
             {/* Aspect Ratio */}
            <motion.section variants={itemVariants} className="flex flex-col gap-3">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Ratio</label>
               <div className="relative group">
                 <select 
                   value={aspectRatio} 
                   onChange={(e) => setAspectRatio(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {ASPECT_RATIOS.map(r => <option key={r} value={r} className="bg-[#0A0A0A]">{r}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>
            
            {/* Variations */}
            <motion.section variants={itemVariants} className="flex flex-col gap-3">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Variations</label>
               <div className="relative group">
                 <select 
                   value={variations} 
                   onChange={(e) => setVariations(Number(e.target.value))}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {[1,2,3].map(v => <option key={v} value={v} className="bg-[#0A0A0A]">{v} Variation{v>1?'s':''}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>

            {/* Style */}
            <motion.section variants={itemVariants} className="flex flex-col gap-3 col-span-2">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Artistic Style</label>
               <div className="flex flex-wrap gap-2">
                 {STYLES.map(s => (
                   <button
                     key={s}
                     onClick={() => setStyle(s)}
                     className={cn(
                       "px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border outline-none focus:ring-2 focus:ring-orange-500/50",
                       style === s 
                         ? "bg-white/10 text-white border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.15)]" 
                         : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20"
                     )}
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </motion.section>
            
            {/* Quality */}
            <motion.section variants={itemVariants} className="flex flex-col gap-3 col-span-2">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Fidelity</label>
               <div className="flex gap-2">
                 {QUALITIES.map(q => (
                   <button
                     key={q}
                     onClick={() => setQuality(q)}
                     className={cn(
                       "flex-1 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-1 hover:-translate-y-0.5 active:translate-y-0 outline-none focus:ring-2 focus:ring-orange-500/50",
                       quality === q 
                         ? "bg-white/10 text-white border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.15)]" 
                         : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/20"
                     )}
                   >
                     <span>{q}</span>
                   </button>
                 ))}
               </div>
            </motion.section>

            {/* Advanced Camera Options */}
            <motion.section variants={itemVariants} className="flex flex-col gap-3">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Bokeh</label>
               <div className="relative group">
                 <select 
                   value={bokeh} 
                   onChange={(e) => setBokeh(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {BOKEH_OPTIONS.map(b => <option key={b} value={b} className="bg-[#0A0A0A]">{b}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="flex flex-col gap-3">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Lighting Direction</label>
               <div className="relative group">
                 <select 
                   value={lighting} 
                   onChange={(e) => setLighting(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {LIGHTING_OPTIONS.map(l => <option key={l} value={l} className="bg-[#0A0A0A]">{l}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="flex flex-col gap-3">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Lens Size</label>
               <div className="relative group">
                 <select 
                   value={lensSize} 
                   onChange={(e) => setLensSize(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {LENS_SIZES.map(l => <option key={l} value={l} className="bg-[#0A0A0A]">{l}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="flex flex-col gap-3">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Camera Angle</label>
               <div className="relative group">
                 <select 
                   value={cameraAngle} 
                   onChange={(e) => setCameraAngle(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {CAMERA_ANGLES.map(a => <option key={a} value={a} className="bg-[#0A0A0A]">{a}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="flex flex-col gap-3 col-span-2">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Film Look</label>
               <div className="relative group">
                 <select 
                   value={filmEffect} 
                   onChange={(e) => setFilmEffect(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-orange-500/50 focus:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                 >
                   {FILM_EFFECTS.map(f => <option key={f} value={f} className="bg-[#0A0A0A]">{f}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </motion.section>

            {/* BG Removal Toggle */}
            <motion.section variants={itemVariants} className="flex flex-col gap-3 col-span-2">
               <label className="flex items-center justify-between p-4 rounded border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Solid Background</span>
                    <span className="text-[10px] text-slate-500 mt-1">Forces a white background for easy extraction</span>
                  </div>
                  <div className={cn("w-10 h-6 rounded-full p-1 transition-all duration-300 relative border border-white/10", removeBackground ? "bg-orange-500/50 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "bg-black/50")}>
                     <motion.div 
                        layout
                        transition={{ type: "spring", stiffness: 700, damping: 30 }}
                        className={cn("w-4 h-4 rounded-full shadow-sm", removeBackground ? "bg-white" : "bg-slate-400")}
                        style={{ marginLeft: removeBackground ? "16px" : "0px" }}
                     />
                  </div>
                  <input type="checkbox" className="hidden" checked={removeBackground} onChange={() => setRemoveBackground(!removeBackground)} />
               </label>
            </motion.section>
            
            {/* Logo Upload */}
             <motion.section variants={itemVariants} className="flex flex-col gap-3 col-span-2">
               <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Brand Integration (Logo)</label>
               {!logoPreview ? (
                  <div 
                    className="border border-dashed border-white/20 rounded p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all text-center bg-white/5 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                     <Upload className="w-5 h-5 text-slate-500 group-hover:text-orange-400 group-hover:-translate-y-1 transition-all duration-300" />
                     <div className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">Click to upload logo</div>
                     <div className="text-[10px] text-slate-500 font-mono">PNG, JPG, up to 5MB</div>
                  </div>
               ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative border border-white/10 rounded p-2 bg-white/5 flex items-center gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="w-16 h-16 rounded bg-black/50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{logoFile?.name}</span>
                      <button onClick={removeLogo} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest text-left w-fit mt-2 transition-colors">Remove</button>
                    </div>
                  </motion.div>
               )}
               <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoUpload} />
             </motion.section>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 pt-4 border-t border-white/5 bg-[#080808]/90 backdrop-blur-md sticky bottom-0 z-20"
        >
          <button
            onClick={generateAssets}
            disabled={isGenerating || !prompt}
            className="w-full py-4 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-black text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] active:scale-[0.98] outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black relative overflow-hidden group"
          >
            {isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="tracking-widest relative z-10">FORGING ASSETS...</span>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2 relative z-10"
              >
                <MonitorPlay className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="tracking-widest">GENERATE</span>
              </motion.div>
            )}
            
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                 initial={{ opacity: 0, y: 10, height: 0 }} 
                 animate={{ opacity: 1, y: 0, height: 'auto' }}
                 exit={{ opacity: 0, scale: 0.95, height: 0 }}
                 className="mt-4 p-3 rounded border border-red-500/20 bg-red-500/10 flex gap-3 text-red-400 text-xs shadow-lg shadow-red-500/5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Content Area - Output Feed / My Assets */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 bg-[#0F0F0F] overflow-y-auto relative p-6 lg:p-12 min-h-screen"
      >
         <div className="max-w-5xl mx-auto flex flex-col gap-8 relative z-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/5 gap-4">
               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-4 items-center">
                 <button 
                  onClick={() => setActiveView('feed')}
                  className={cn("font-serif text-2xl tracking-tight transition-colors", activeView === 'feed' ? "text-white" : "text-slate-600 hover:text-slate-400")}
                 >
                   Output Feed
                 </button>
                 <span className="text-white/10 text-2xl font-light">/</span>
                 <button 
                  onClick={() => setActiveView('saved')}
                  className={cn("font-serif text-2xl tracking-tight transition-colors flex items-center gap-2", activeView === 'saved' ? "text-white" : "text-slate-600 hover:text-slate-400")}
                 >
                   My Assets
                   <Bookmark className={cn("w-4 h-4", activeView === 'saved' ? "fill-orange-500/20 text-orange-400" : "")} />
                 </button>
               </motion.div>
               <motion.div 
                 initial={{ x: 20, opacity: 0 }} 
                 animate={{ x: 0, opacity: 1 }} 
                 transition={{ delay: 0.2 }}
                 className="flex items-center gap-3"
               >
                 {activeView === 'feed' ? (
                   <div className="text-[10px] text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded font-mono font-bold shadow-inner">
                     {assets.length} ASSETS
                   </div>
                 ) : (
                   <div className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded font-mono font-bold shadow-inner">
                     {assets.filter(a => a.isSaved).length} SAVED
                   </div>
                 )}
               </motion.div>
            </header>

            {(() => {
              const displayedAssets = activeView === 'feed' ? assets : assets.filter(a => a.isSaved);
              
              if (displayedAssets.length === 0) {
                return (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 0.5, scale: 1 }}
                   transition={{ duration: 0.6, delay: 0.3 }}
                   className="flex flex-col items-center justify-center py-32 select-none"
                 >
                    <div className="w-32 h-32 border-2 border-white/5 relative flex items-center justify-center mb-6">
                      <div className="absolute inset-0 border border-orange-500/20 m-2 animate-pulse"></div>
                      <ImageIcon className="w-8 h-8 text-white opacity-20 stroke-[1]" />
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/20"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/20"></div>
                    </div>
                    <p className="text-[10px] tracking-widest font-bold text-slate-400 uppercase">
                      {activeView === 'feed' ? "THE FORGE IS EMPTY" : "NO SAVED ASSETS"}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 font-mono">
                      {activeView === 'feed' ? "Describe your vision to begin creation." : "Bookmark assets to save them here."}
                    </p>
                 </motion.div>
                );
              }
              
              return (
                 <div className={cn(
                   "grid gap-8 pb-32",
                   activeView === 'saved' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 xl:grid-cols-2"
                 )}>
                    <AnimatePresence mode="popLayout">
                      {displayedAssets.map((asset) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                          key={asset.id} 
                          className="flex flex-col gap-4 group"
                        >
                           <div className="relative overflow-hidden bg-[#050505] border border-white/10 rounded flex items-center justify-center p-2 group-hover:border-white/20 transition-all duration-300 shadow-xl group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={asset.url} 
                                alt="Generated Ad" 
                                className="w-full h-auto max-h-[70vh] object-contain rounded shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02]" 
                              />
                              
                              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                  onClick={() => toggleSaveAsset(asset.id)}
                                  className={cn(
                                    "w-8 h-8 rounded backdrop-blur border flex items-center justify-center transition-all text-white active:scale-90",
                                    asset.isSaved ? "bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30 text-orange-400" : "bg-black/60 border-white/10 hover:bg-white/10 hover:border-white/30"
                                  )}
                                  title={asset.isSaved ? "Remove from My Assets" : "Save to My Assets"}
                                >
                                  <Bookmark className={cn("w-4 h-4 drop-shadow", asset.isSaved ? "fill-current" : "")} />
                                </button>
                                <button 
                                  onClick={() => setEditingAssetId(asset.id)}
                                  className="w-8 h-8 rounded bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all text-white active:scale-90"
                                  title="Edit Asset"
                                >
                                  <Edit2 className="w-4 h-4 drop-shadow" />
                                </button>
                                <button 
                                  onClick={() => handleDownload(asset)}
                                  className="w-8 h-8 rounded bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all text-white active:scale-90"
                                  title="Download Asset"
                                >
                                  <Download className="w-4 h-4 drop-shadow" />
                                </button>
                                <button 
                                  onClick={() => deleteAsset(asset.id)}
                                  className="w-8 h-8 ml-2 rounded bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all text-white active:scale-90"
                                  title="Delete Asset"
                                >
                                  <Trash2 className="w-4 h-4 drop-shadow" />
                                </button>
                              </div>
                           </div>
                           <div className="flex flex-col gap-3 px-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                 <span className="text-[9px] uppercase font-bold tracking-widest text-orange-400 bg-orange-950/30 px-2 py-1 rounded border border-orange-500/20 shadow-sm">{asset.aspectRatio}</span>
                                 <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10 shadow-sm">{asset.quality}</span>
                                 {asset.style !== 'None' && (
                                   <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10 shadow-sm">{asset.style}</span>
                                 )}
                                </div>
                                <div className="text-[9px] flex items-center gap-1 font-mono text-slate-500 whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  {new Date(asset.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div className="text-[11px] leading-relaxed italic text-slate-400 font-serif border-l-2 border-orange-500/30 pl-3 break-words bg-gradient-to-r from-orange-500/5 to-transparent py-1 pr-2">
                                {asset.prompt}
                              </div>
                           </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                 </div>
              );
            })()}
         </div>
         <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none z-0 hidden lg:block"></div>
      </motion.div>
      
      {/* Image Editor Modal */}
      <AnimatePresence>
        {editingAssetId && (
          <ImageEditor
            imageUrl={assets.find(a => a.id === editingAssetId)?.url || ''}
            onSave={(newUrl) => handleEditorSave(editingAssetId, newUrl)}
            onCancel={() => setEditingAssetId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
