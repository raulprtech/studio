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
  action: z.enum(['generate', 'paraphrase', 'summarize', 'expand', 'changeTone']),
  topic: z.string().optional().describe('The topic or headline for generating a new blog post section.'),
  currentContent: z.string().optional().describe('The existing content of the blog post, to provide context.'),
  selectedText: z.string().optional().describe('The specific text selected by the user to be modified.'),
  tone: z.enum(['Professional', 'Casual', 'Humorous']).optional().describe('The desired tone for the "changeTone" action.'),
});
export type WritingAssistantInput = z.infer<typeof WritingAssistantInputSchema>;

const WritingAssistantOutputSchema = z.object({
  draft: z
    .string()
    .describe('The AI-generated draft for the blog post section or the modified text.'),
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
  prompt: `You are a world-class blog writer and content strategist. Your primary goal is to assist the user by performing a specific action on their text.

The user wants to perform the action: **{{{action}}}**.

{{#if selectedText}}
The user has selected the following text to modify:
---
{{{selectedText}}}
---
{{/if}}

{{#if currentContent}}
For context, here is the full content of the blog post so far:
---
{{{currentContent}}}
---
{{/if}}

Based on the action, follow these instructions precisely:

- If the action is **"generate"**:
  You have been given a topic: **"{{{topic}}}"**.
  Generate a new, well-written section for the blog post based on this topic. Use the "Current Content" for context to ensure the new section flows naturally. Make the tone engaging, informative, and easy to read. Use markdown for formatting.

- If the action is **"paraphrase"**:
  Rephrase the "Selected Text" to improve clarity and style while preserving the original meaning.

- If the action is **"summarize"**:
  Condense the "Selected Text" into a concise summary, capturing only the most essential points.

- If the action is **"expand"**:
  Elaborate on the "Selected Text". Add more details, examples, or explanations to make it more comprehensive.

- If the action is **"changeTone"**:
  Rewrite the "Selected Text" to have a **{{{tone}}}** tone.

Your response should ONLY be the resulting text (the generated section, the paraphrase, the summary, etc.), ready to be inserted into the editor. Do not add any extra commentary or explanation.
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
