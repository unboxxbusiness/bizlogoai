
'use server';

/**
 * @fileOverview Generates a logo based on the brand name, color palette, design style, logo style, and font style.
 *
 * - generateLogo - A function that handles the logo generation process.
 * - LogoGenerationInput - The input type for the generateLogo function.
 * - LogoGenerationOutput - The return type for the generateLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogoGenerationInputSchema = z.object({
  brandName: z.string().describe('The name of the brand for which to generate a logo.'),
  colorPalette: z
    .enum(['vibrant', 'pastel', 'dark mode', 'monochrome', 'Earthy Tones', 'Oceanic Blues', 'Sunset Hues', 'Forest Greens'])
    .describe('The color palette to use for the logo.'),
  designStyle:
    z.enum(['Minimalist', 'Geometric', 'Abstract', 'Vintage', 'Modern']).describe('The design style of the logo.'),
  logoStyle:
    z.enum(['Icon-based', 'Wordmark', 'Lettermark', 'Emblem', 'Combination Mark', 'Mascot']).describe('The style of the logo.'),
  fontStyle: z.enum(['Serif', 'Sans-serif', 'Script', 'Display', 'Modern', 'Futuristic', 'Elegant', 'Playful']).describe('The font style to use for the logo text.'),
});

export type LogoGenerationInput = z.infer<typeof LogoGenerationInputSchema>;

const LogoGenerationOutputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      'The generated logo as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  prompt: z.string().describe('The prompt that was used to generate the logo.'),
  suggestedFontName: z.string().describe('A common, real-world font name suggestion that aligns with the chosen font style (e.g., Roboto for Sans-serif, Times New Roman for Serif).'),
});

export type LogoGenerationOutput = z.infer<typeof LogoGenerationOutputSchema>;

export async function generateLogo(input: LogoGenerationInput): Promise<LogoGenerationOutput> {
  return generateLogoFlow(input);
}

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: LogoGenerationInputSchema,
    outputSchema: LogoGenerationOutputSchema,
  },
  async (input: LogoGenerationInput) => {
    const imagePrompt = `Generate a logo for the brand "${input.brandName}" with the following characteristics:
- Color Palette: ${input.colorPalette}
- Design Style: ${input.designStyle}
- Logo Style: ${input.logoStyle}
- Font Style: ${input.fontStyle}
The logo should be visually appealing and suitable for a business.
The logo must be 800x800 pixels.
If the logo style is Wordmark or Lettermark, ensure the brand name is prominent and uses the specified font style. For Icon-based, Emblem, Combination Mark, or Mascot logos, if text is part of the design, it should also reflect the chosen font style.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media URL.');
    }

    // New: Call a text model to suggest a font name
    const fontSuggestionPrompt = `Given the following logo design choices for a brand named "${input.brandName}":
- Color Palette: ${input.colorPalette}
- Design Style: ${input.designStyle}
- Logo Style: ${input.logoStyle}
- Font Style: ${input.fontStyle}

Based *specifically* on the Font Style category "${input.fontStyle}", suggest one or two common, easily available (e.g., on Google Fonts) real-world font names that a designer might typically use for this style.
For example:
- If Font Style is 'Sans-serif', suggest 'Roboto' or 'Open Sans'.
- If Font Style is 'Serif', suggest 'Merriweather' or 'Playfair Display'.
- If Font Style is 'Script', suggest 'Pacifico' or 'Lobster'.
- If Font Style is 'Display', suggest 'Bebas Neue' or 'Anton'.
- If Font Style is 'Modern', suggest 'Montserrat' or 'Raleway'.
- If Font Style is 'Futuristic', suggest 'Orbitron' or 'Audiowide'.
- If Font Style is 'Elegant', suggest 'Great Vibes' or 'Cinzel'.
- If Font Style is 'Playful', suggest 'Comic Sans MS' (if appropriate for playfulness) or 'Fredoka One'.

Respond with only the font name(s) as a short string, like "Roboto, Open Sans" or "Lobster". Do not add any other explanatory text.`;

    let suggestedFontName = "N/A";
    try {
      const fontSuggestionResponse = await ai.generate({
        prompt: fontSuggestionPrompt,
        // This will use the default model configured in src/ai/genkit.ts (e.g., gemini-2.0-flash for text)
      });
      const textResponse = fontSuggestionResponse.text?.trim();
      if (textResponse) {
        suggestedFontName = textResponse;
      }
    } catch (fontError) {
      console.warn("Could not get font suggestion:", fontError instanceof Error ? fontError.message : fontError);
    }

    return {
      logoDataUri: media.url,
      prompt: imagePrompt,
      suggestedFontName: suggestedFontName,
    };
  }
);
