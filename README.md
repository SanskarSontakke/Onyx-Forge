## Overview

Onyx Forge is an advanced AI image generation platform designed specifically for creating stunning product marketing banners and visual assets. Powered by Google's state-of-the-art Gemini and Imagen models, it offers unprecedented control over photographic elements to generate visually striking advertisements.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/155e7bfd-cac2-4183-a34c-67b369175177" />

## Features

- **Prompt Auto-Enhancement:** Automatically refines simple descriptions into highly detailed, visceral prompts optimized for product advertising using Gemini.
- **Advanced Camera Controls:** Fine-tune your generations with specific photographic parameters:
  - Artistic Styles (Cyberpunk, Luxe, Minimalist, etc.)
  - Lens Sizes & Camera Angles
  - Lighting Directions & Bokeh Effects
  - Film Grain & Aesthetic Looks
- **Brand Integration:** Seamlessly upload and incorporate your brand's logo into the generated scenes.
- **Multi-Model Support:** Choose between `gemini-2.5-flash-image`, `imagen-3.0-generate-002`, and `gemini-3.0-pro-image`.
- **Asset Management:** Save, edit, download, and manage your generated assets in a curated feed.
- **Image Editing:** Built-in tools for cropping and refining generated assets.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Styling:** React 19, Tailwind CSS v4, [Motion](https://motion.dev/) (Animations), Lucide React
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
