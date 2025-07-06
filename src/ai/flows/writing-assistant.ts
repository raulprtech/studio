'use server';
/**
 * @fileOverview A writing assistant AI flow for helping with blog post content.
 *
 * Exporta:
 * - writingAssistant - A function that generates a draft for a blog section.
 * - WritingAssistantInput - The input type for the writingAssistant function.
 * - WritingAssistantOutput - The return type for the writingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WritingAssistantInputSchema = z.object({
  topic: z.string().describe('The topic or headline for the blog post section.'),
  currentContent: z.string().optional().describe('The existing content of the blog post, to provide context.'),
});
export type WritingAssistantInput = z.infer<typeof WritingAssistantInputSchema>;

const WritingAssistantOutputSchema = z.object({
  draft: z
    .string()
    .describe('The AI-generated draft for the blog post section.'),
});
export type WritingAssistantOutput = z.infer<typeof WritingAssistantOutputSchema>;

export async function writingAssistant(
  input: WritingAssistantInput
): Promise<WritingAssistantOutput> {
  return writingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'writingAssistantPrompt',
  input: {schema: WritingAssistantInputSchema},
  output: {schema: WritingAssistantOutputSchema},
  prompt: `You are a world-class blog writer and content strategist. Your goal is to help the user write a compelling blog post.

You will be given a topic and the current content of the post. Generate a well-written section for the blog post based on the topic.

If there is existing content, you can use it for context to make your generated text flow naturally. You can either continue from it, or write a new section that complements it.

Make the tone engaging, informative, and easy to read. Use markdown for formatting if necessary (e.g., headings, bold text, lists).

Topic: {{{topic}}}

Current Content:
---
{{{currentContent}}}
---
`,
});

const writingAssistantFlow = ai.defineFlow(
  {
    name: 'writingAssistantFlow',
    inputSchema: WritingAssistantInputSchema,
    outputSchema: WritingAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
