# Onyx Forge

> Generate product marketing banners using Google's Gemini and Imagen models with control over camera, lighting, and brand assets.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

<img width="1920" height="1080" alt="Onyx Forge interface" src="https://github.com/user-attachments/assets/155e7bfd-cac2-4183-a34c-67b369175177" />

## What it does

Onyx Forge is a Next.js web app for generating product marketing banners using Google's Gemini and Imagen AI models. It automatically enhances simple product descriptions into detailed prompts, lets you control photographic elements (lighting, camera angles, artistic style), upload logos, and save generated images.

## Why I built it

I wanted to explore how modern AI image models work, especially with structured prompt control and multi-model options. This project combines Gemini (for prompt enhancement) and Imagen (for image generation) to see how chaining different models can improve output quality.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Styling:** React 19, Tailwind CSS v4, [Motion](https://motion.dev/), Lucide React
- **AI Integration:** `@google/genai` SDK
- **Image Processing:** `react-image-crop`

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- A Google Gemini API Key

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: The project uses `.env.example` as a template)*

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

1. **Input:** User enters a product description and optional photographic parameters (style, lighting, camera angle, etc.)
2. **Prompt Enhancement:** Gemini processes the input and generates a detailed, structured prompt optimized for image generation
3. **Image Generation:** Imagen receives the enhanced prompt and creates the marketing banner
4. **Refinement:** User can crop, edit, and re-generate until satisfied
5. **Export:** Download the final asset or save to the project library

The app chains two Google AI models: Gemini for language understanding and Imagen for image synthesis. This layered approach aims to bridge the gap between natural-language product briefs and photorealistic AI-generated assets.

## Results / status

Working demo. The core pipeline (prompt enhancement → image generation → asset management) functions as designed. Built as a learning project to explore multi-model AI workflows.

## License

MIT © 2026 Sanskar Sontakke
