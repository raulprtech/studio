'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating schema suggestions based on a data description.
 *
 * It exports:
 * - `generateSchemaSuggestion`: The main function to trigger the flow.
 * - `SchemaSuggestionInput`: The input type for the `generateSchemaSuggestion` function.
 * - `SchemaSuggestionOutput`: The output type for the `generateSchemaSuggestion` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SchemaSuggestionInputSchema = z.object({
  dataDescription: z
    .string()
    .describe('A description of the data to be stored in Firestore.'),
});
export type SchemaSuggestionInput = z.infer<typeof SchemaSuggestionInputSchema>;

const SchemaSuggestionOutputSchema = z.object({
  suggestedSchema: z
    .string()
    .describe(
      'A suggested Zod schema based on the data description. The schema should define the shape and types of data expected in Firestore.'
    ),
});
export type SchemaSuggestionOutput = z.infer<typeof SchemaSuggestionOutputSchema>;

export async function generateSchemaSuggestion(
  input: SchemaSuggestionInput
): Promise<SchemaSuggestionOutput> {
  return generateSchemaSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'schemaSuggestionPrompt',
  input: {schema: SchemaSuggestionInputSchema},
  output: {schema: SchemaSuggestionOutputSchema},
  prompt: `You are an AI schema generator. Please provide a Zod schema based on the following data description:\n\nData Description: {{{dataDescription}}}\n\nEnsure that the schema is well-structured and includes appropriate data types for each field described. The schema should be complete and ready to use.
`,
});

const generateSchemaSuggestionFlow = ai.defineFlow(
  {
    name: 'generateSchemaSuggestionFlow',
    inputSchema: SchemaSuggestionInputSchema,
    outputSchema: SchemaSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
