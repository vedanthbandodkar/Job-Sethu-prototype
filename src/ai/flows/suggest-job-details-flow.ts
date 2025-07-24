
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

const SuggestJobDetailsInputSchema = z.object({
  title: z.string().describe('A simple job title provided by the user.'),
});
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
      'An array of 1-3 of the most relevant skills for the job, formatted as individual strings. Usually, 1 or 2 skills are sufficient.'
    ),
});
export type SuggestJobDetailsOutput = z.infer<typeof SuggestJobDetailsOutputSchema>;


export async function suggestJobDetails(
  input: SuggestJobDetailsInput
): Promise<SuggestJobDetailsOutput> {
  return suggestJobDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestJobDetailsPrompt',
  input: { schema: SuggestJobDetailsInputSchema },
  output: { schema: SuggestJobDetailsOutputSchema },
  prompt: `You are an expert at creating clear and concise job postings for a local marketplace app.
A user has provided a job title. Your task is to expand this title into a professional, friendly job description and extract a list of relevant skills.

The description should be helpful and encouraging. The skills should be specific and relevant to the job.

**Job Title:** {{{title}}}

Generate a response based on this title.`,
});

const suggestJobDetailsFlow = ai.defineFlow(
  {
    name: 'suggestJobDetailsFlow',
    inputSchema: SuggestJobDetailsInputSchema,
    outputSchema: SuggestJobDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
