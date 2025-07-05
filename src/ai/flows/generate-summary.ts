// src/ai/flows/generate-summary.ts
'use server';
/**
 * @fileOverview A flow for summarizing data in a Firestore collection.
 *
 * - generateSummary - A function that generates a summary of the collection.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  collectionName: z.string().describe('The name of the Firestore collection to summarize.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the data in the Firestore collection.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  prompt: `You are an expert at summarizing data from Firestore collections.

You will be provided the name of a Firestore collection. You will generate a summary of the data in the collection.

Collection Name: {{{collectionName}}}
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
