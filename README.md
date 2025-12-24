# Onyx Forge

Onyx Forge is an advanced AI-powered application designed to generate professional advertising banner images and marketing assets. By leveraging Google's Gemini API, it transforms product descriptions into high-quality visual assets tailored for digital marketing campaigns.

## Features

-   **AI Image Generation**: Create stunning product images using `gemini-2.5-flash-image`.
-   **Prompt Enhancement**: Automatically refine and detail your product descriptions using `gemini-2.5-flash` for better generation results.
-   **Style Customization**: Choose from various artistic styles including Cyberpunk, Minimalist, Luxe, Retro, Industrial, and Raw.
-   **Format Options**: Support for multiple aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4) suitable for different social media and ad platforms.
-   **Quality Control**: Select from Standard, High, or Ultra quality settings to control detail and lighting.
-   **Brand Integration**: Upload your brand logo to seamlessly incorporate it into the generated designs.
-   **A/B Testing**: Generate multiple variations (1x, 2x, 3x) of a concept simultaneously to test different angles and contexts.
-   **Background Removal**: Option to generate images with transparent backgrounds.
-   **Smart Error Handling**: Detailed feedback on API errors, safety violations, and network issues.

## Tech Stack

-   **Frontend**: React 19, Vite, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Integration**: Google Gen AI SDK (`@google/genai`)

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   A Google Cloud project with the Generative Language API enabled and an API key.

## Installation & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a file named `.env.local` in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run the application:**
    ```bash
    npm run dev
    ```
    The application will start, and you can access it at `http://localhost:3000` (or the port shown in your terminal).

## Usage

1.  **Enter Prompt**: Type a description of your product in the prompt box. You can use the "✨ AUTO-ENHANCE" button to have AI improve your prompt.
2.  **Product URL**: (Optional) Add a link to your product for context.
3.  **Configure Settings**: Select your desired Aspect Ratio, Quality, and Artistic Style.
4.  **Upload Logo**: (Optional) Upload a PNG or JPG of your brand logo.
5.  **Variations**: Choose how many variations you want to generate.
6.  **Generate**: Click "GENERATE ASSET" and wait for your images to appear in the Output Feed.

## Troubleshooting

-   **Safety Violation**: If the generated content is flagged for safety, try modifying your prompt to be more neutral.
-   **Rate Limit**: If you hit the API quota (Error 429), wait a minute before trying again.
-   **Permission Denied**: Ensure your API key is correct and has the necessary permissions.
