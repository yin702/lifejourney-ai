// A public domain or creative commons classical piece suitable for "Moon River" vibe
// Using a placeholder URL for demonstration. In a real app, host the MP3.
// This is Chopin's Nocturne, which has a similar melancholic/romantic vibe.
export const BACKGROUND_MUSIC_URL = "https://upload.wikimedia.org/wikipedia/commons/2/29/Chopin_Nocturne_Op_9_No_2_-_Eflat_Major.ogg";

export const DEFAULT_PROMPT_TEMPLATE = `
Generate a photorealistic portrait of this person at age \${age}.
Maintain the facial features, ethnicity, and gender from the reference images provided.
The style should be a high-quality personal photograph suitable for a photo album.
Background should be neutral or contextually appropriate for the era (approx \${year}).
`;

export const MODEL_OPTIONS = [
  { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (Faster)' },
  { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image (Higher Quality)' },
];