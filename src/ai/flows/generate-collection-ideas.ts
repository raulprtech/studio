'use server';
/**
 * @fileOverview Un flujo de IA para generar nuevas ideas para una colección basadas en documentos existentes.
 *
 * Exporta:
 * - generateCollectionIdeas - Una función que genera ideas.
 * - CollectionIdeasInput - El tipo de entrada para la función generateCollectionIdeas.
 * - CollectionIdeasOutput - El tipo de retorno para la función generateCollectionIdeas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CollectionIdeasInputSchema = z.object({
  collectionName: z.string().describe('El nombre de la colección de Firestore.'),
  documentsJson: z.string().describe('Un string JSON que representa una muestra de documentos existentes.'),
});
export type CollectionIdeasInput = z.infer<typeof CollectionIdeasInputSchema>;

const IdeaSchema = z.object({
    title: z.string().describe('El título o punto principal de la nueva idea. Debe ser conciso.'),
    description: z.string().describe('Una breve descripción (1-2 frases) de la idea y por qué es relevante.'),
});

export const CollectionIdeasOutputSchema = z.object({
    ideas: z.array(IdeaSchema).describe('Una lista de 5 nuevas y creativas ideas relevantes para la colección.'),
});
export type CollectionIdeasOutput = z.infer<typeof CollectionIdeasOutputSchema>;

export async function generateCollectionIdeas(
  input: CollectionIdeasInput
): Promise<CollectionIdeasOutput> {
  return generateCollectionIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'collectionIdeasPrompt',
  input: {schema: CollectionIdeasInputSchema},
  output: {schema: CollectionIdeasOutputSchema},
  prompt: `Eres un asistente de lluvia de ideas creativo y estratégico. Tu tarea es analizar una muestra de documentos de una colección de Firestore llamada '{{{collectionName}}}' y generar 5 nuevas ideas para añadir a esta colección. Responde siempre en español.

Las ideas deben ser relevantes para el contenido existente, pero también creativas y aportar algo nuevo.

Colección: {{{collectionName}}}

Documentos existentes como ejemplo (en formato JSON):
---
{{{documentsJson}}}
---

Basado en estos documentos, genera 5 ideas. Para cada idea, proporciona un título y una breve descripción. Por ejemplo, si la colección es de 'posts', sugiere nuevos temas para posts. Si es de 'products', sugiere nuevos productos.
`,
});


const generateCollectionIdeasFlow = ai.defineFlow(
  {
    name: 'generateCollectionIdeasFlow',
    inputSchema: CollectionIdeasInputSchema,
    outputSchema: CollectionIdeasOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
