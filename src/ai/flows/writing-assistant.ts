'use server';
/**
 * @fileOverview Un flujo de IA de asistente de escritura para ayudar con el contenido de las entradas de blog.
 *
 * Exporta:
 * - writingAssistant - Una función que genera un borrador para una sección de blog.
 * - WritingAssistantInput - El tipo de entrada para la función writingAssistant.
 * - WritingAssistantOutput - El tipo de retorno para la función writingAssistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WritingAssistantInputSchema = z.object({
  action: z.enum(['generate', 'paraphrase', 'summarize', 'expand', 'changeTone']),
  topic: z.string().optional().describe('El tema o titular para generar una nueva sección de entrada de blog.'),
  currentContent: z.string().optional().describe('El contenido existente de la entrada del blog, para proporcionar contexto.'),
  selectedText: z.string().optional().describe('El texto específico seleccionado por el usuario para ser modificado.'),
  tone: z.enum(['Professional', 'Casual', 'Humorous']).optional().describe('El tono deseado para la acción "changeTone".'),
});
export type WritingAssistantInput = z.infer<typeof WritingAssistantInputSchema>;

const WritingAssistantOutputSchema = z.object({
  draft: z
    .string()
    .describe('El borrador generado por la IA para la sección de la entrada del blog o el texto modificado.'),
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
  prompt: `Eres un escritor de blogs y estratega de contenido de clase mundial. Tu objetivo principal es ayudar al usuario realizando una acción específica en su texto. Debes responder siempre en español.

El usuario quiere realizar la acción: **{{{action}}}**.

{{#if selectedText}}
El usuario ha seleccionado el siguiente texto para modificar:
---
{{{selectedText}}}
---
{{/if}}

{{#if currentContent}}
Para contexto, aquí está el contenido completo de la entrada del blog hasta ahora:
---
{{{currentContent}}}
---
{{/if}}

Basado en la acción, sigue estas instrucciones precisamente:

- Si la acción es **"generate"**:
  Se te ha dado un tema: **"{{{topic}}}"**.
  Genera una nueva sección bien escrita para la entrada del blog basada en este tema. Usa el "Contenido Actual" para el contexto para asegurar que la nueva sección fluya naturalmente. Haz que el tono sea atractivo, informativo y fácil de leer. Usa markdown para el formato.

- Si la acción es **"paraphrase"**:
  Reformula el "Texto Seleccionado" para mejorar la claridad y el estilo, conservando el significado original.

- Si la acción es **"summarize"**:
  Condensa el "Texto Seleccionado" en un resumen conciso, capturando solo los puntos más esenciales.

- Si la acción es **"expand"**:
  Elabora sobre el "Texto Seleccionado". Agrega más detalles, ejemplos o explicaciones para hacerlo más completo.

- Si la acción es **"changeTone"**:
  Reescribe el "Texto Seleccionado" para que tenga un tono **{{{tone}}}**.

Tu respuesta debe ser ÚNICAMENTE el texto resultante (la sección generada, la paráfrasis, el resumen, etc.), listo para ser insertado en el editor. No agregues ningún comentario o explicación adicional.
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
