import React, { useState, useRef } from 'react';
import { ImageResult } from './components/ImageResult';
import { generateBannerImage, enhancePrompt, generatePromptVariations } from './services/geminiService';
import { ASPECT_RATIOS, QUALITY_OPTIONS, STYLE_OPTIONS, SAMPLE_PROMPTS } from './constants';
import { AspectRatio, GeneratedImage, Quality, StylePreset, VariationCount } from './types';

interface ErrorState {
  title: string;
  steps: string[];
}

function App() {
  const [description, setDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [quality, setQuality] = useState<Quality>('Standard');
  const [style, setStyle] = useState<StylePreset>('None');
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [variationCount, setVariationCount] = useState<VariationCount>(1);
  const [logo, setLogo] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('GENERATING ASSET');
  const [progress, setProgress] = useState(0);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDetailedError = (err: any): ErrorState => {
    const message = (err instanceof Error ? err.message : String(err)).toLowerCase();

    // Safety / Blocked Content
    if (message.includes('safety') || message.includes('blocked') || message.includes('harmful') || message.includes('prohibited')) {
      return {
        title: 'CONTENT SAFETY VIOLATION',
        steps: [
          'The AI model detected sensitive content in the prompt or image.',
          'Modify the description to be more neutral or professional.',
          'Ensure the product URL does not link to restricted categories (e.g., medical, weapons, adult).',
          'Avoid mentioning real people or copyrighted characters.'
        ]
      };
    }

    // Quota / Rate Limit (429)
    if (message.includes('429') || message.includes('quota') || message.includes('limit') || message.includes('resource exhausted')) {
      return {
        title: 'RATE LIMIT EXCEEDED',
        steps: [
          'You have hit the maximum number of requests allowed.',
          'Please pause for 60 seconds to let the quota reset.',
          'If you are on a free tier, these limits are lower.',
          'Consider upgrading your Google Cloud project quota if frequent.'
        ]
      };
    }

    // Permission / Auth (403)
    if (message.includes('403') || message.includes('permission') || message.includes('key') || message.includes('authorized')) {
      return {
        title: 'PERMISSION DENIED',
        steps: [
          'The API Key is missing, invalid, or expired.',
          'Verify the API Key is correctly set in your environment variables.',
          'Ensure the Google Cloud project has the "Generative Language API" enabled.',
          'Check if your project has billing enabled (required for some models).'
        ]
      };
    }

    // Server Errors (500/503)
    if (message.includes('503') || message.includes('500') || message.includes('internal') || message.includes('unavailable') || message.includes('overloaded')) {
      return {
        title: 'SERVICE UNAVAILABLE',
        steps: [
          'Google\'s AI servers are currently experiencing high traffic.',
          'This is a temporary issue on the provider side.',
          'Please wait a few minutes and try again.',
          'Check the Google Cloud Service Health Dashboard.'
        ]
      };
    }

    // Invalid Request (400)
    if (message.includes('400') || message.includes('invalid argument') || message.includes('bad request')) {
      return {
        title: 'INVALID REQUEST PARAMETERS',
        steps: [
          'Check if the Product URL is publicly accessible and free of typos.',
          'Ensure the URL protocol is correct (http:// or https://).',
          'The prompt might be too complex or contain unsupported characters.',
          'Try removing the Product URL to see if that resolves the issue.'
        ]
      };
    }

    // Silent Refusal / No Data
    if (message.includes('no image data found')) {
      return {
        title: 'GENERATION PRODUCED NO OUTPUT',
        steps: [
          'The model accepted the prompt but returned an empty response.',
          'This often happens if the Product URL content cannot be read.',
          'Try slightly rewording your description.',
          'Try generating without the Product URL to isolate the issue.'
        ]
      };
    }

    // Network / Connectivity
    if (message.includes('fetch failed') || message.includes('network') || message.includes('failed to fetch')) {
      return {
        title: 'NETWORK CONNECTION ERROR',
        steps: [
          'Unable to connect to Google API servers.',
          'Check your internet connection.',
          'Disable ad-blockers, VPNs, or firewalls that might block API calls.',
          'Ensure you are not offline.'
        ]
      };
    }

    // Default generic error
    return {
      title: 'UNEXPECTED ERROR',
      steps: [
        `System Message: ${message}`,
        'Try simplifying your prompt.',
        'Check your internet connection.',
        'Refresh the page and try again.'
      ]
    };
  };

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError(null);
      return;
    }
    
    if (url.includes(' ')) {
        setUrlError("URL CANNOT CONTAIN SPACES");
        return;
    }
    
    if (!/^https?:\/\//i.test(url)) {
      setUrlError("URL MUST START WITH HTTP:// OR HTTPS://");
      return;
    }

    try {
      new URL(url);
      setUrlError(null);
    } catch {
      setUrlError("INVALID URL FORMAT");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProductUrl(val);
    validateUrl(val);
  };

  const handleEnhancePrompt = async () => {
    if (!description) return;
    setEnhancing(true);
    try {
      const enhanced = await enhancePrompt(description);
      setDescription(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setEnhancing(false);
    }
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!description || urlError) return;
    
    setLoading(true);
    setLoadingText('INITIALIZING...');
    setProgress(0);
    setError(null);

    // Simulate progress
    const estimatedDuration = variationCount > 1 ? 15000 : 8000;
    const intervalTime = 100;
    const steps = estimatedDuration / intervalTime;
    const increment = 95 / steps; // Target 95% then wait
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + increment;
      });
    }, intervalTime);
    
    try {
      let promptsToExecute = [description];

      // 1. Generate variations if requested
      if (variationCount > 1) {
        setLoadingText('DESIGNING VARIATIONS...');
        promptsToExecute = await generatePromptVariations(description, variationCount);
      }

      setLoadingText(`RENDERING ${variationCount > 1 ? variationCount + ' ASSETS' : 'ASSET'}...`);

      // 2. Execute requests in parallel
      const imagePromises = promptsToExecute.map(prompt => 
        generateBannerImage(prompt, productUrl, aspectRatio, quality, style, transparentBackground, logo)
          .then(url => ({ url, prompt }))
      );

      const results = await Promise.all(imagePromises);

      const newImages: GeneratedImage[] = results.map(res => ({
        id: crypto.randomUUID(),
        url: res.url,
        aspectRatio,
        prompt: res.prompt, // Use the specific variation prompt
        createdAt: Date.now()
      }));

      // Complete progress
      setProgress(100);
      setGeneratedImages(prev => [...newImages, ...prev]);

      // Small delay to show completion before resetting state
      await new Promise(resolve => setTimeout(resolve, 600));

    } catch (err) {
      setError(getDetailedError(err));
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setLoadingText('GENERATE ASSET');
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 border-b-2 border-white pb-4 sm:pb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase break-words">
            Onyx Forge
          </h1>
          <div className="mt-2 text-xs sm:text-sm font-mono uppercase tracking-widest text-gray-400 flex flex-col sm:flex-row sm:justify-between gap-2">
            <span>Gemini 2.5 Flash / High Contrast Mode</span>
            <span>v2.3.0</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-8 sm:space-y-12 mb-12 sm:mb-16">
          
          {/* Prompt - Always Full Width */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="description" className="block text-sm font-bold uppercase tracking-wider text-white">
                Prompt
              </label>
              <button
                onClick={handleEnhancePrompt}
                disabled={!description || enhancing}
                className={`text-xs uppercase font-bold tracking-wider px-2 py-1 border border-white transition-all ${
                  !description || enhancing ? 'text-gray-600 border-gray-600' : 'text-white hover:bg-white hover:text-black'
                }`}
              >
                {enhancing ? 'ENHANCING...' : '✨ AUTO-ENHANCE'}
              </button>
            </div>
            <textarea
              id="description"
              rows={3}
              className="w-full bg-black border-2 border-white p-4 text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-black focus:placeholder-gray-600 focus:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300 ease-out rounded-none font-mono text-sm"
              placeholder="ENTER PRODUCT DESCRIPTION..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDescription(sample.description);
                    setProductUrl(sample.url);
                    setUrlError(null);
                  }}
                  className="text-xs uppercase border border-white px-2 py-1 hover:bg-white hover:text-black transition-colors rounded-none"
                >
                  Ex. {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Core Settings */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Product URL */}
              <div className="space-y-2">
                <label htmlFor="url" className="block text-sm font-bold uppercase tracking-wider text-white">
                  Product URL
                </label>
                <input
                  type="url"
                  id="url"
                  className={`w-full bg-black border-2 p-4 text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-black focus:placeholder-gray-600 focus:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300 ease-out rounded-none font-mono text-sm ${
                    urlError ? 'border-red-500' : 'border-white'
                  }`}
                  placeholder="HTTPS://..."
                  value={productUrl}
                  onChange={handleUrlChange}
                />
                {urlError && (
                  <p className="text-red-500 text-xs font-bold font-mono tracking-wide uppercase">
                    {urlError}
                  </p>
                )}
              </div>

              {/* Style Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-white">
                  Artistic Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStyle(opt.value)}
                      className={`px-3 py-2 sm:py-1 text-xs font-bold uppercase border transition-all rounded-none flex-grow sm:flex-grow-0 ${
                        style === opt.value
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-gray-400 border-gray-600 hover:border-white hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-white">
                    Format
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`px-3 py-2 text-xs sm:text-sm font-bold uppercase border-2 transition-all rounded-none flex-1 sm:flex-none ${
                          aspectRatio === ratio.value
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-white hover:bg-gray-900'
                        }`}
                      >
                        {ratio.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-white">
                    Quality
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuality(opt.value)}
                        className={`px-3 py-2 text-xs sm:text-sm font-bold uppercase border-2 transition-all rounded-none flex-1 ${
                          quality === opt.value
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-white hover:bg-gray-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Assets & Advanced */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Logo Upload */}
              <div className="space-y-2">
                 <label className="block text-sm font-bold uppercase tracking-wider text-white">
                   Brand Logo
                 </label>
                 {!logo ? (
                   <div className="relative">
                     <input
                       type="file"
                       ref={fileInputRef}
                       onChange={handleLogoUpload}
                       accept="image/png, image/jpeg"
                       className="hidden"
                       id="logo-upload"
                     />
                     <label
                       htmlFor="logo-upload"
                       className="flex items-center justify-center w-full h-[58px] bg-black border-2 border-white border-dashed hover:bg-gray-900 cursor-pointer transition-colors"
                     >
                       <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                         + Upload PNG/JPG
                       </span>
                     </label>
                   </div>
                 ) : (
                   <div className="relative flex items-center justify-between w-full h-[58px] bg-black border-2 border-white px-4">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <img src={logo} alt="Logo Preview" className="h-8 w-8 object-contain bg-white/10 shrink-0" />
                       <span className="text-xs font-bold uppercase tracking-wider text-white truncate">Logo Uploaded</span>
                     </div>
                     <button
                       onClick={removeLogo}
                       className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 shrink-0"
                     >
                       Remove
                     </button>
                   </div>
                 )}
              </div>

              {/* Variations */}
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-white">
                  A/B Testing Variations
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setVariationCount(num as VariationCount)}
                      className={`flex-1 py-2 text-sm font-bold uppercase border-2 transition-all rounded-none ${
                        variationCount === num
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-white border-white hover:bg-gray-900'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Toggle */}
              <div className="space-y-2">
                 <label className="block text-sm font-bold uppercase tracking-wider text-white">
                   Background
                 </label>
                 <label className="flex items-center space-x-3 cursor-pointer group w-fit p-1 -ml-1">
                  <div 
                    className={`w-6 h-6 border-2 border-white flex items-center justify-center transition-colors ${transparentBackground ? 'bg-white' : 'bg-black'}`}
                    onClick={() => setTransparentBackground(!transparentBackground)}
                  >
                    {transparentBackground && <span className="text-black font-bold text-lg leading-none">✓</span>}
                  </div>
                  <span 
                    className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-gray-300 select-none"
                    onClick={() => setTransparentBackground(!transparentBackground)}
                  >
                    Transparent
                  </span>
                </label>
              </div>

            </div>
          </div>

          {/* Action */}
          <div>
            {loading ? (
              <div className="w-full h-[62px] border-2 border-white relative bg-black overflow-hidden select-none">
                <div 
                  className="absolute top-0 left-0 h-full bg-white transition-all duration-100 ease-linear will-change-[width]"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-6 z-10 mix-blend-difference text-white">
                    <span className="font-black uppercase tracking-widest text-lg animate-pulse">{loadingText}</span>
                    <span className="font-mono font-bold text-lg">{Math.round(progress)}%</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!description || !!urlError}
                className={`w-full py-4 text-lg font-black uppercase tracking-widest border-2 transition-all rounded-none ${
                  !description || !!urlError
                    ? 'bg-black text-gray-400 border-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white text-black border-white hover:bg-black hover:text-white'
                }`}
              >
                GENERATE ASSET
              </button>
            )}
            
            {error && (
              <div className="mt-6 border-2 border-red-500 p-6">
                <h3 className="text-red-500 font-black uppercase tracking-widest mb-4">
                  ERROR: {error.title}
                </h3>
                <ul className="list-disc list-inside space-y-2 font-mono text-sm text-white">
                  {error.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {generatedImages.length > 0 && (
          <div className="space-y-8 sm:space-y-12 border-t-2 border-white pt-8 sm:pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Output Feed</h2>
            <div className="space-y-8 sm:space-y-12">
              {generatedImages.map((image) => (
                <ImageResult key={image.id} image={image} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
