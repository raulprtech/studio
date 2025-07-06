'use server';

/**
 * @fileOverview Este archivo contiene el flujo de Genkit para generar sugerencias de esquemas de Zod
 * basadas en la descripción de datos proporcionada.
 *
 * Exporta:
 * - `generateSchemaSuggestion`: La función principal para activar el flujo.
 * - `SchemaSuggestionInput`: El tipo de entrada para la función `generateSchemaSuggestion`.
 * - `SchemaSuggestionOutput`: El tipo de salida de la función `generateSchemaSuggestion`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SchemaSuggestionInputSchema = z.object({
  dataDescription: z
    .string()
    .describe('Una descripción de los datos que se almacenarán en Firestore.'),
});
export type SchemaSuggestionInput = z.infer<typeof SchemaSuggestionInputSchema>;

const SchemaSuggestionOutputSchema = z.object({
  suggestedSchema: z
    .string()
    .describe(
      'Un esquema de Zod sugerido basado en la descripción de los datos. El esquema debe definir la forma y los tipos de datos esperados en Firestore.'
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
  prompt: `Eres un generador de esquemas de IA. Proporciona un esquema de Zod basado en la siguiente descripción de datos:\n\nDescripción de Datos: {{{dataDescription}}}\n\nAsegúrate de que el esquema esté bien estructurado e incluya los tipos de datos apropiados para cada campo descrito. El esquema debe estar completo y listo para usar.
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
