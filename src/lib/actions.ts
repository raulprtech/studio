"use server";

import { generateSchemaSuggestion } from "@/ai/flows/generate-schema-suggestion";
import { generateSummary } from "@/ai/flows/generate-summary";
import { z } from "zod";
import { authAdmin, firestoreAdmin, isFirebaseAdminInitialized } from "./firebase-admin";
import { revalidatePath } from "next/cache";

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


// User Management Actions

const updateUserRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(["Admin", "Editor", "Viewer"]),
});

export async function updateUserRoleAction(prevState: any, formData: FormData) {
  if (!isFirebaseAdminInitialized || !authAdmin) {
    return { message: "Action failed: Firebase is not configured.", success: false };
  }

  const validatedFields = updateUserRoleSchema.safeParse({
    uid: formData.get('uid'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      success: false,
    };
  }
  
  const { uid, role } = validatedFields.data;
  
  try {
    await authAdmin.setCustomUserClaims(uid, { role });
    revalidatePath('/authentication');
    return { message: `Successfully updated role to ${role}.`, success: true };
  } catch (error) {
    return { message: `Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`, success: false };
  }
}

export async function sendPasswordResetAction(email: string) {
    if (!isFirebaseAdminInitialized || !authAdmin) {
        return { message: "Action failed: Firebase is not configured.", success: false };
    }
    try {
        // This only generates a link. A real app would use an email service to send it.
        // For this demo, successfully generating the link is considered a success.
        await authAdmin.generatePasswordResetLink(email);
        return { message: `Password reset successfully initiated for ${email}.`, success: true };
    } catch (error) {
        return { message: `Failed to send password reset: ${error instanceof Error ? error.message : 'Unknown error'}`, success: false };
    }
}


export async function toggleUserStatusAction(uid: string, isDisabled: boolean) {
    if (!isFirebaseAdminInitialized || !authAdmin) {
        return { message: "Action failed: Firebase is not configured.", success: false };
    }
    try {
        await authAdmin.updateUser(uid, { disabled: isDisabled });
        revalidatePath('/authentication');
        const status = isDisabled ? "disabled" : "enabled";
        return { message: `User successfully ${status}.`, success: true };
    } catch (error) {
        return { message: `Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`, success: false };
    }
}
