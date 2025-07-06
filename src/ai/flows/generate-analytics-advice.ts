'use server';
/**
 * @fileOverview Un flujo de IA para generar consejos de análisis de datos.
 *
 * Exporta:
 * - generateAnalyticsAdvice - Una función que genera consejos basados en datos de análisis.
 * - AnalyticsAdviceInput - El tipo de entrada para la función generateAnalyticsAdvice.
 * - AnalyticsAdviceOutput - El tipo de retorno para la función generateAnalyticsAdvice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyticsAdviceInputSchema = z.object({
  summary: z.object({
    totalUsers: z.string(),
    newUsers: z.string(),
    sessions: z.string(),
    activeUsers: z.string(),
  }),
  userChartData: z.array(z.object({
    date: z.string(),
    users: z.number(),
  })),
  topPages: z.array(z.object({
    page: z.string(),
    views: z.string(),
  })),
});
export type AnalyticsAdviceInput = z.infer<typeof AnalyticsAdviceInputSchema>;

const AnalyticsAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('Consejos prácticos y específicos en formato markdown para mejorar las métricas proporcionadas.'),
});
export type AnalyticsAdviceOutput = z.infer<typeof AnalyticsAdviceOutputSchema>;

export async function generateAnalyticsAdvice(
  input: AnalyticsAdviceInput
): Promise<AnalyticsAdviceOutput> {
  return generateAnalyticsAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyticsAdvicePrompt',
  input: {schema: AnalyticsAdviceInputSchema},
  output: {schema: AnalyticsAdviceOutputSchema},
  prompt: `Eres un experto en crecimiento y análisis de datos de clase mundial. Tu objetivo es analizar las siguientes métricas de un sitio web y proporcionar consejos claros, concisos y prácticos para mejorarlas. Proporciona siempre tu respuesta en español.

Aquí están los datos del último período:

**Resumen de Métricas:**
- Usuarios Totales: {{{summary.totalUsers}}}
- Nuevos Usuarios: {{{summary.newUsers}}}
- Sesiones: {{{summary.sessions}}}
- Usuarios Activos: {{{summary.activeUsers}}}

**Datos de Usuarios (histórico reciente):**
{{#each userChartData}}
- Mes: {{date}}, Usuarios: {{users}}
{{/each}}

**Páginas Más Vistas:**
{{#each topPages}}
- Página: "{{page}}", Vistas: {{views}}
{{/each}}

Basado en estos datos, proporciona un análisis y al menos 3 consejos prácticos. Formatea tu respuesta usando markdown. Estructura tus consejos con un título claro (usando ##) y luego una explicación. Sé específico en tus recomendaciones. Por ejemplo, en lugar de "mejora el SEO", sugiere "optimiza la página '{{topPages.0.page}}' para las palabras clave X e Y, ya que es la más popular".
`,
});

const generateAnalyticsAdviceFlow = ai.defineFlow(
  {
    name: 'generateAnalyticsAdviceFlow',
    inputSchema: AnalyticsAdviceInputSchema,
    outputSchema: AnalyticsAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
