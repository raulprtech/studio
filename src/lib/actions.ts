"use server";

import { generateSchemaSuggestion } from "@/ai/flows/generate-schema-suggestion";
import { generateSummary } from "@/ai/flows/generate-summary";
import { z } from "zod";
import { authAdmin, firestoreAdmin, isFirebaseAdminInitialized } from "./firebase-admin";
import { revalidatePath } from "next/cache";
import admin from 'firebase-admin';
import { mockData } from "./mock-data";

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

// Document Management Actions

export async function duplicateDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseAdminInitialized || !firestoreAdmin) {
        return { message: "Action failed: Firebase is not configured.", success: false };
    }
    try {
        const docRef = firestoreAdmin.collection(collectionId).doc(documentId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return { message: `Document with ID ${documentId} not found.`, success: false };
        }
        const data = docSnap.data();
        await firestoreAdmin.collection(collectionId).add(data!);
        revalidatePath(`/collections/${collectionId}`);
        return { message: `Document duplicated successfully.`, success: true };
    } catch (error) {
        return { message: `Failed to duplicate document: ${error instanceof Error ? error.message : 'Unknown error'}`, success: false };
    }
}

export async function deleteDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseAdminInitialized || !firestoreAdmin) {
        return { message: "Action failed: Firebase is not configured.", success: false };
    }
    try {
        await firestoreAdmin.collection(collectionId).doc(documentId).delete();
        revalidatePath(`/collections/${collectionId}`);
        return { message: `Document deleted successfully.`, success: true };
    } catch (error) {
        return { message: `Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`, success: false };
    }
}

export async function getDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseAdminInitialized || !firestoreAdmin) {
        console.warn("Firebase not initialized. Returning mock data.");
        const collectionData = mockData[collectionId] || [];
        const document = collectionData.find(doc => doc.id === documentId);
        if (!document) {
            return { data: null, error: "Document not found in mock data." };
        }
        return { data: document, error: null };
    }

    try {
        const docRef = firestoreAdmin.collection(collectionId).doc(documentId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return { data: null, error: "Document not found." };
        }
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } catch (error) {
        return { data: null, error: `Failed to fetch document: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}

export async function updateDocumentAction(prevState: any, formData: FormData) {
    if (!isFirebaseAdminInitialized || !firestoreAdmin) {
        return { message: "Action failed: Firebase is not configured.", success: false };
    }

    const collectionId = formData.get('collectionId') as string;
    const documentId = formData.get('documentId') as string;

    if (!collectionId || !documentId) {
        return { message: "Collection ID and Document ID are required.", success: false };
    }

    try {
        const docRef = firestoreAdmin.collection(collectionId).doc(documentId);
        const originalDocSnap = await docRef.get();
        if (!originalDocSnap.exists) {
            return { message: "Document not found.", success: false };
        }
        const originalData = originalDocSnap.data()!;
        
        const dataToUpdate: { [key: string]: any } = {};
        
        for (const key in originalData) {
            if (Object.prototype.hasOwnProperty.call(originalData, key)) {
                if (formData.has(key)) {
                    const formValue = formData.get(key) as string;
                    const originalValue = originalData[key];

                    if (typeof originalValue === 'number') {
                        dataToUpdate[key] = Number(formValue);
                    } else if (typeof originalValue === 'boolean') {
                        dataToUpdate[key] = formValue === 'on'; // HTML checkbox sends 'on' when checked
                    } else if (originalValue && typeof originalValue.toDate === 'function') { // Firestore Timestamp
                        dataToUpdate[key] = admin.firestore.Timestamp.fromDate(new Date(formValue));
                    } else if (originalValue instanceof Date) {
                         dataToUpdate[key] = new Date(formValue);
                    }
                    else {
                        dataToUpdate[key] = formValue;
                    }
                } else if (typeof originalData[key] === 'boolean') {
                    // If a checkbox is not in form data, it was unchecked.
                     dataToUpdate[key] = false;
                }
            }
        }
        
        await docRef.update(dataToUpdate);

        revalidatePath(`/collections/${collectionId}`);
        revalidatePath(`/collections/${collectionId}/${documentId}/edit`);
        return { message: `Document '${documentId}' updated successfully.`, success: true };

    } catch (error) {
        return { message: `Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`, success: false };
    }
}
