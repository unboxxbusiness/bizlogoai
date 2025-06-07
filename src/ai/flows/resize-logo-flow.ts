
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
    const resizePrompt = `You are an image processing bot. Your task is to resize the provided logo.
The input logo is for the brand "${input.brandName}".
**CRITICAL INSTRUCTION: The output image's dimensions MUST BE EXACTLY ${input.targetWidth} pixels wide AND ${input.targetHeight} pixels tall.**
Do not deviate from these target dimensions under any circumstances.
- If the original aspect ratio is different from the target ${input.targetWidth}x${input.targetHeight} aspect ratio:
    - First, scale the logo to fit one dimension (width or height to be the larger of the two relative to the target, while maintaining original aspect ratio).
    - Then, crop the logo from the center to meet the other dimension, ensuring the most important parts of the logo remain visible and centered.
- Do NOT add any padding, letterboxing, or pillarboxing.
- Do NOT distort or stretch the logo's original aspect ratio.
- Maintain the highest possible visual quality and clarity of the original logo design.
- Output the final resized image in ${input.targetFormat} format.
The final image MUST be precisely ${input.targetWidth}x${input.targetHeight} pixels. This is the most important requirement.`;

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

