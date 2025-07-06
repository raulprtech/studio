// src/ai/flows/generate-summary.ts
'use server';
/**
 * @fileOverview Un flujo para resumir los datos en una colección de Firestore.
 *
 * Exporta:
 * - generateSummary - Una función que genera un resumen de la colección.
 * - GenerateSummaryInput - El tipo de entrada para la función generateSummary.
 * - GenerateSummaryOutput - El tipo de retorno para la función generateSummary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  collectionName: z.string().describe('El nombre de la colección de Firestore a resumir.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('Un resumen de los datos en la colección de Firestore.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  prompt: `Eres un experto en resumir datos de colecciones de Firestore.

Se te proporcionará el nombre de una colección de Firestore. Generarás un resumen de los datos en la colección.

Nombre de la Colección: {{{collectionName}}}
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
