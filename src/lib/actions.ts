"use server";

import { generateSchemaSuggestion } from "@/ai/flows/generate-schema-suggestion";
import { generateSummary } from "@/ai/flows/generate-summary";
import { z } from "zod";

const schemaSuggestionSchema = z.object({
  dataDescription: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export async function getSchemaSuggestionAction(prevState: any, formData: FormData) {
  const validatedFields = schemaSuggestionSchema.safeParse({
    dataDescription: formData.get('dataDescription'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      schema: null,
    };
  }

  try {
    const result = await generateSchemaSuggestion({ dataDescription: validatedFields.data.dataDescription });
    return {
      errors: null,
      message: "Schema generated successfully.",
      schema: result.suggestedSchema
    };
  } catch (error) {
    return {
      errors: null,
      message: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
      schema: null,
    };
  }
}

export async function getCollectionSummaryAction(collectionName: string) {
  try {
    const result = await generateSummary({ collectionName });
    return {
      summary: result.summary,
      error: null,
    };
  } catch (error) {
    return {
      summary: null,
      error: `An error occurred while generating summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
