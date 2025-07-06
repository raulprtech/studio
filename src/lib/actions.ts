"use server";

import { generateSchemaSuggestion } from "@/ai/flows/generate-schema-suggestion";
import { generateSummary } from "@/ai/flows/generate-summary";
import { z } from "zod";
import { firestoreAdmin, isFirebaseAdminInitialized } from "./firebase-admin";

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

const updateSchemaSchema = z.object({
  collectionId: z.string(),
  schemaDefinition: z.string().min(1, { message: "Schema cannot be empty." }),
});

export async function updateSchemaAction(prevState: any, formData: FormData) {
  if (!isFirebaseAdminInitialized || !firestoreAdmin) {
    return {
        errors: null,
        message: "Action failed: Firebase is not configured on the server. Please check your .env.local file.",
        success: false,
    };
  }

  const validatedFields = updateSchemaSchema.safeParse({
    collectionId: formData.get('collectionId'),
    schemaDefinition: formData.get('schemaDefinition'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
      success: false,
    };
  }

  const { collectionId, schemaDefinition } = validatedFields.data;

  try {
    const schemaDocRef = firestoreAdmin.collection('_schemas').doc(collectionId);
    await schemaDocRef.set({
      definition: schemaDefinition,
      updatedAt: new Date(),
    });

    return {
      errors: null,
      message: `Schema for '${collectionId}' updated successfully in Firestore.`,
      success: true,
    };
  } catch (error) {
    console.error("Error updating schema in Firestore:", error);
    return {
      errors: null,
      message: `Failed to update schema in Firestore. Please check server logs and Firebase configuration.`,
      success: false,
    };
  }
}
