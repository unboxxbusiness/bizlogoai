
'use server';

/**
 * @fileOverview Generates a logo based on the brand name, color palette, design style, and logo style.
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
    .enum(['vibrant', 'pastel', 'dark mode', 'monochrome'])
    .describe('The color palette to use for the logo.'),
  designStyle:
    z.enum(['Minimalist', 'Geometric', 'Abstract', 'Vintage', 'Modern']).describe('The design style of the logo.'),
  logoStyle:
    z.enum(['Icon-based', 'Wordmark', 'Lettermark', 'Emblem']).describe('The style of the logo.'),
});

export type LogoGenerationInput = z.infer<typeof LogoGenerationInputSchema>;

const LogoGenerationOutputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      'The generated logo as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  prompt: z.string().describe('The prompt that was used to generate the logo.'),
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
- Logo Style: ${input.logoStyle}`;

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

    return {
      logoDataUri: media.url,
      prompt: imagePrompt,
    };
  }
);
