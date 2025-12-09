import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Quality, StylePreset } from "../types";

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert prompt engineer for AI image generation. Rewrite the following product description into a highly detailed, vivid, and effective prompt for an image generator. Focus on lighting, texture, composition, and mood. Keep it under 60 words. Do not add conversational text, just return the prompt.
      
      Input: "${originalPrompt}"`,
    });

    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    // Fallback to original if enhancement fails
    return originalPrompt;
  }
};

export const generatePromptVariations = async (basePrompt: string, count: number): Promise<string[]> => {
  if (count <= 1) return [basePrompt];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a creative director generating A/B testing variations for an ad campaign.
      
      Base Concept: "${basePrompt}"
      
      Generate ${count} distinct prompt variations based on this concept.
      - Variation 1: Focus purely on Product Details (Macro/Close-up).
      - Variation 2: Focus on Lifestyle/Context/Atmosphere.
      - Variation 3 (if requested): Focus on Bold Minimalism or Abstract Composition.
      
      Keep each prompt under 50 words. Return ONLY a valid JSON array of strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return Array(count).fill(basePrompt);
    
    const variations = JSON.parse(text);
    if (Array.isArray(variations) && variations.length > 0) {
      // Ensure we have exactly 'count' items, filling with basePrompt if needed
      while (variations.length < count) variations.push(basePrompt);
      return variations.slice(0, count);
    }
    
    return Array(count).fill(basePrompt);
  } catch (error) {
    console.error("Variation Generation Error:", error);
    // Fallback: just return original prompt N times
    return Array(count).fill(basePrompt);
  }
};

export const generateBannerImage = async (
  description: string,
  productUrl: string,
  aspectRatio: AspectRatio,
  quality: Quality,
  style: StylePreset,
  transparentBackground: boolean,
  logoBase64?: string | null
): Promise<string> => {
  // Always create a new instance to ensure we get the latest key if it changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let qualityModifier = "";
  switch (quality) {
    case 'High':
      qualityModifier = " The image should be highly detailed with sharp focus, professional color grading, and studio lighting.";
      break;
    case 'Ultra':
      qualityModifier = " The image should be an ultra-realistic 8k masterpiece, with intricate textures, cinematic lighting, hyper-realistic composition, and zero artifacts.";
      break;
    case 'Standard':
    default:
      qualityModifier = " The image should be photorealistic, with perfect lighting and composition suitable for a digital marketing campaign.";
      break;
  }

  let styleModifier = "";
  switch (style) {
    case 'Cyberpunk':
      styleModifier = " Aesthetic: Cyberpunk, neon lights, high contrast, futuristic, dark atmosphere with vibrant accents.";
      break;
    case 'Minimalist':
      styleModifier = " Aesthetic: Minimalist, clean lines, plenty of negative space, soft lighting, pastel or monochrome palette.";
      break;
    case 'Luxe':
      styleModifier = " Aesthetic: Luxury, elegant, gold and marble textures, sophisticated lighting, high-end editorial look.";
      break;
    case 'Retro':
      styleModifier = " Aesthetic: Retro 80s/90s, grain, vintage color processing, synthwave vibe, nostalgic.";
      break;
    case 'Industrial':
      styleModifier = " Aesthetic: Industrial, raw concrete, steel, dramatic shadows, brutalist architecture, cold lighting.";
      break;
    case 'None':
    default:
      styleModifier = "";
      break;
  }

  // Construct a prompt
  let promptText = `Generate a professional advertising banner image for the following product description: "${description}".${qualityModifier} ${styleModifier}`;
  
  if (transparentBackground) {
    promptText += " The image must be generated with a transparent background, isolating the subject completely.";
  }

  if (productUrl) {
    promptText += `\n\nThe product is associated with this URL: ${productUrl}.`;
  }

  if (logoBase64) {
    promptText += `\n\nIncorporate the provided brand logo into the design naturally and professionally. Ensure the logo is visible but does not overpower the main product.`;
  }
  
  try {
    const parts: any[] = [{ text: promptText }];

    // If a logo is provided, add it as an inline data part
    if (logoBase64) {
      // Remove data URI prefix (e.g. "data:image/png;base64,")
      const base64Data = logoBase64.split(',')[1]; 
      // Detect mime type or default to png
      const mimeMatch = logoBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    // Parse response for image data
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};