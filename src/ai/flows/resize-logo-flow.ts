
'use server';
/**
 * @fileOverview Resizes a given logo to specified dimensions.
 *
 * - resizeLogo - A function that handles the logo resizing process.
 * - ResizeLogoInput - The input type for the resizeLogo function.
 * - ResizeLogoOutput - The return type for the resizeLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResizeLogoInputSchema = z.object({
  originalLogoDataUri: z
    .string()
    .describe(
      "The original logo image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetWidth: z.number().describe('The target width for the resized logo in pixels.'),
  targetHeight: z.number().describe('The target height for the resized logo in pixels.'),
  targetFormat: z.string().default('PNG').describe('The desired output format (e.g., PNG, JPEG).'),
  brandName: z.string().describe('The brand name, for context if needed by the model.')
});

export type ResizeLogoInput = z.infer<typeof ResizeLogoInputSchema>;

const ResizeLogoOutputSchema = z.object({
  resizedLogoDataUri: z
    .string()
    .describe(
      'The resized logo as a data URI. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  prompt: z.string().describe('The prompt that was used to resize the logo.'),
});

export type ResizeLogoOutput = z.infer<typeof ResizeLogoOutputSchema>;

export async function resizeLogo(input: ResizeLogoInput): Promise<ResizeLogoOutput> {
  return resizeLogoFlow(input);
}

const resizeLogoFlow = ai.defineFlow(
  {
    name: 'resizeLogoFlow',
    inputSchema: ResizeLogoInputSchema,
    outputSchema: ResizeLogoOutputSchema,
  },
  async (input: ResizeLogoInput) => {
    const resizePrompt = `Take the following logo image for the brand "${input.brandName}" and resize it to be exactly ${input.targetWidth} pixels wide and ${input.targetHeight} pixels tall.
Maintain the original design's integrity and clarity as much as possible. Avoid any distortions or changes to the logo's core elements.
If the original aspect ratio differs from the target ${input.targetWidth}x${input.targetHeight}, intelligently adapt the logo. Prefer scaling and then cropping if necessary to fill the dimensions, or add padding if cropping would harm the logo. The final image must be exactly ${input.targetWidth}x${input.targetHeight} pixels.
Output the resized image as a ${input.targetFormat} file.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.originalLogoDataUri}},
        {text: resizePrompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image resizing failed to return a media URL.');
    }

    return {
      resizedLogoDataUri: media.url,
      prompt: resizePrompt,
    };
  }
);

