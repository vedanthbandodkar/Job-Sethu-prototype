
'use server';
/**
 * @fileOverview An AI flow to suggest replies in a chat conversation.
 *
 * - suggestReplies - A function that suggests chat replies based on context.
 * - SuggestRepliesInput - The input type for the suggestReplies function.
 * - SuggestRepliesOutput - The return type for the suggestReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRepliesInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job being discussed.'),
  jobDescription: z.string().describe('The description of the job.'),
  chatHistory: z
    .array(
      z.object({
        senderId: z.string(),
        content: z.string(),
      })
    )
    .describe('The existing chat history between the two users.'),
  currentUserId: z
    .string()
    .describe('The ID of the user for whom we are generating suggestions.'),
  userRole: z
    .enum(['poster', 'worker'])
    .describe(
      'The role of the user for whom we are generating suggestions (either the job poster or the applicant/worker).'
    ),
});
export type SuggestRepliesInput = z.infer<typeof SuggestRepliesInputSchema>;

const SuggestRepliesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of 3-4 professional and relevant reply suggestions.'),
});
export type SuggestRepliesOutput = z.infer<typeof SuggestRepliesOutputSchema>;

export async function suggestReplies(
  input: SuggestRepliesInput
): Promise<SuggestRepliesOutput> {
  return suggestRepliesFlow(input);
}

const formatChatHistory = (
  history: SuggestRepliesInput['chatHistory'],
  currentUserId: string
) => {
  return history
    .map(
      (msg) =>
        `${msg.senderId === currentUserId ? 'You' : 'Other User'}: ${
          msg.content
        }`
    )
    .join('\n');
};

const prompt = ai.definePrompt({
  name: 'suggestRepliesPrompt',
  input: {
    schema: z.object({
      jobTitle: z.string(),
      jobDescription: z.string(),
      formattedChatHistory: z.string(),
      userRole: z.string(),
    }),
  },
  output: {schema: SuggestRepliesOutputSchema},
  prompt: `You are a helpful and professional communication assistant for a job marketplace app.
Your goal is to help users communicate effectively by suggesting relevant replies.

You will be given the job details and the current chat history. Based on this context, generate 3-4 short, relevant, and professionally-toned reply suggestions for the user identified as "You".

The current user's role is: **{{{userRole}}}**. Tailor your suggestions to fit this role. For example, a 'poster' might ask about availability or qualifications, while a 'worker' might confirm details or ask about next steps.

The suggestions should be natural next steps in the conversation. For example, if the last message was a question, suggest answers. If it was a statement, suggest follow-up questions or acknowledgements. Do not suggest replies that have already been said.

**Job Title:** {{{jobTitle}}}
**Job Description:** {{{jobDescription}}}

**Chat History:**
{{{formattedChatHistory}}}

Based on the full context, provide suggestions for "You" (the {{{userRole}}}).`,
});

const suggestRepliesFlow = ai.defineFlow(
  {
    name: 'suggestRepliesFlow',
    inputSchema: SuggestRepliesInputSchema,
    outputSchema: SuggestRepliesOutputSchema,
  },
  async (input) => {
    const formattedChatHistory = formatChatHistory(
      input.chatHistory,
      input.currentUserId
    );

    const {output} = await prompt({
      jobTitle: input.jobTitle,
      jobDescription: input.jobDescription,
      formattedChatHistory,
      userRole: input.userRole,
    });
    return output!;
  }
);
