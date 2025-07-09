
'use server';
/**
 * @fileOverview A flow to generate an image for a job posting.
 *
 * - generateJobImage - A function that generates an image based on a job title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJobImageInputSchema = z.string();
type GenerateJobImageInput = z.infer<typeof GenerateJobImageInputSchema>;

const GenerateJobImageOutputSchema = z.string();
type GenerateJobImageOutput = z.infer<typeof GenerateJobImageOutputSchema>;


export async function generateJobImage(title: GenerateJobImageInput): Promise<GenerateJobImageOutput> {
  return generateJobImageFlow(title);
}

const generateJobImageFlow = ai.defineFlow(
  {
    name: 'generateJobImageFlow',
    inputSchema: GenerateJobImageInputSchema,
    outputSchema: GenerateJobImageOutputSchema,
  },
  async (jobTitle) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually appealing and professional image that represents the following job title: "${jobTitle}". The image should be suitable as a background for a job posting card. Focus on concepts and metaphors rather than literal representations. For example, for "website designer", an image of abstract code lines or a clean, modern desk setup would be appropriate.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return media?.url ?? '';
  }
);
