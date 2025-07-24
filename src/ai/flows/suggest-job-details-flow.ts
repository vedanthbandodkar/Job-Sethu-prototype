
'use server';
/**
 * @fileOverview An AI flow to suggest job details based on a title.
 *
 * - suggestJobDetails - A function that suggests a job description and skills.
 * - SuggestJobDetailsInput - The input type for the suggestJobDetails function.
 * - SuggestJobDetailsOutput - The return type for the suggestJobDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestJobDetailsInputSchema = z.string().describe('A simple job title provided by the user.');
export type SuggestJobDetailsInput = z.infer<typeof SuggestJobDetailsInputSchema>;

const SuggestJobDetailsOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A detailed, professional, and friendly job description expanded from the title. It should be 2-4 sentences long.'
    ),
  skills: z
    .array(z.string())
    .describe(
      'An array of 3-5 relevant skills for the job, formatted as individual strings.'
    ),
});
export type SuggestJobDetailsOutput = z.infer<typeof SuggestJobDetailsOutputSchema>;


export async function suggestJobDetails(
  title: SuggestJobDetailsInput
): Promise<SuggestJobDetailsOutput> {
  return suggestJobDetailsFlow(title);
}

const prompt = ai.definePrompt({
  name: 'suggestJobDetailsPrompt',
  input: { schema: SuggestJobDetailsInputSchema },
  output: { schema: SuggestJobDetailsOutputSchema },
  prompt: `You are an expert at creating clear and concise job postings for a local marketplace app.
A user has provided a job title. Your task is to expand this title into a professional, friendly job description and extract a list of relevant skills.

The description should be helpful and encouraging. The skills should be specific and relevant to the job.

**Job Title:** {{{prompt}}}

Generate a response based on this title.`,
});

const suggestJobDetailsFlow = ai.defineFlow(
  {
    name: 'suggestJobDetailsFlow',
    inputSchema: SuggestJobDetailsInputSchema,
    outputSchema: SuggestJobDetailsOutputSchema,
  },
  async (title) => {
    const {output} = await prompt(title);
    return output!;
  }
);
