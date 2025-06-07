
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
    // New, more forceful prompt
    const resizePrompt = `TASK: Precise Image Resize.
INPUT IMAGE: [Provided via media url input]
BRAND CONTEXT: The logo is for a brand named "${input.brandName}". This context is for your understanding of the image's subject matter to make informed cropping decisions if necessary. Do not add the brand name as text to the image unless it's already part of the original logo.

OUTPUT REQUIREMENTS:
1.  **ABSOLUTE DIMENSIONS (CRITICAL & NON-NEGOTIABLE)**:
    *   The final output image's width MUST BE EXACTLY ${input.targetWidth} pixels.
    *   The final output image's height MUST BE EXACTLY ${input.targetHeight} pixels.
    *   There is NO TOLERANCE for deviation from these dimensions. This is the MOST IMPORTANT instruction.

2.  **ASPECT RATIO & CONTENT PRESERVATION**:
    *   The primary goal is to fit the most important parts of the original logo within the new ${input.targetWidth}x${input.targetHeight} dimensions.
    *   Maintain the original logo's aspect ratio during scaling. DO NOT STRETCH OR SQUASH the logo.
    *   **Scaling Step**: Scale the original image (preserving its aspect ratio) so that it is large enough to cover the *entire* ${input.targetWidth}x${input.targetHeight} target area. One dimension of the scaled logo will match the target, and the other will be equal or larger.
    *   **Cropping Step**: After scaling, crop the image from the center outwards to precisely ${input.targetWidth}x${input.targetHeight} pixels. Ensure the most visually significant elements of the logo remain centered and as complete as possible.

3.  **NO PADDING/BACKGROUND FILLING**:
    *   DO NOT add any padding, letterboxing, pillarboxing, or background color fills to achieve the target dimensions. The original logo content (after scaling and cropping) must fill the entire ${input.targetWidth}x${input.targetHeight} frame.

4.  **VISUAL QUALITY**:
    *   Maintain the highest possible visual quality, sharpness, and clarity of the original logo throughout the process.

5.  **OUTPUT FORMAT**:
    *   Render the final image in ${input.targetFormat} format.

**REITERATION OF CRITICAL FAILURE CONDITION**: If the output image is NOT EXACTLY ${input.targetWidth}x${input.targetHeight} pixels, the task is considered a COMPLETE FAILURE. Verify dimensions before outputting.`;

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
