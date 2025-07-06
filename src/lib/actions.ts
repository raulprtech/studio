
"use server";

import { generateSchemaSuggestion } from "@/ai/flows/generate-schema-suggestion";
import { generateSummary } from "@/ai/flows/generate-summary";
import { writingAssistant, type WritingAssistantInput } from "@/ai/flows/writing-assistant";
import { z } from "zod";
import { authAdmin, firestoreAdmin, storageAdmin } from "./firebase-admin";
import { revalidatePath } from "next/cache";
import admin from 'firebase-admin';
import { mockData } from "./mock-data";
import { isFirebaseLive } from "./mode";
import { cookies } from "next/headers";

export async function setAppModeAction(mode: 'live' | 'demo') {
  cookies().set('app-mode', mode, { path: '/', maxAge: 60 * 60 * 24 * 365 }); // Set for a year
  revalidatePath('/', 'layout');
  return { success: true, message: `Modo cambiado a ${mode}` };
}

const schemaSuggestionSchema = z.object({
  dataDescription: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
});

export async function getSchemaSuggestionAction(prevState: any, formData: FormData) {
  const validatedFields = schemaSuggestionSchema.safeParse({
    dataDescription: formData.get('dataDescription'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'La validación falló.',
      schema: null,
    };
  }

  try {
    const result = await generateSchemaSuggestion({ dataDescription: validatedFields.data.dataDescription });
    return {
      errors: null,
      message: "Esquema generado con éxito.",
      schema: result.suggestedSchema
    };
  } catch (error) {
    return {
      errors: null,
      message: `Ocurrió un error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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
      error: `Ocurrió un error al generar el resumen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

const updateSchemaSchema = z.object({
  collectionId: z.string(),
  schemaDefinition: z.string().min(1, { message: "El esquema no puede estar vacío." }),
  icon: z.string().optional(),
});

export async function updateSchemaAction(prevState: any, formData: FormData) {
  if (!isFirebaseLive()) {
    return {
        errors: null,
        message: "Acción fallida: La aplicación está en modo demo. Cambia a modo real para guardar en Firestore.",
        success: false,
    };
  }

  const validatedFields = updateSchemaSchema.safeParse({
    collectionId: formData.get('collectionId'),
    schemaDefinition: formData.get('schemaDefinition'),
    icon: formData.get('icon'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validación fallida. Por favor, revisa los campos.',
      success: false,
    };
  }

  const { collectionId, schemaDefinition, icon } = validatedFields.data;

  try {
    const schemaDocRef = firestoreAdmin!.collection('_schemas').doc(collectionId);
    await schemaDocRef.set({
      definition: schemaDefinition,
      icon: icon || null,
      updatedAt: new Date(),
    }, { merge: true });

    revalidatePath('/collections');
    revalidatePath(`/collections/${collectionId}/edit`);

    return {
      errors: null,
      message: `Esquema para '${collectionId}' actualizado con éxito en Firestore.`,
      success: true,
    };
  } catch (error) {
    console.error("Error al actualizar el esquema en Firestore:", error);
    return {
      errors: null,
      message: `No se pudo actualizar el esquema en Firestore. Por favor, revisa los logs del servidor y la configuración de Firebase.`,
      success: false,
    };
  }
}

const createCollectionSchema = z.object({
  collectionName: z.string().min(1, 'El nombre de la colección es obligatorio.').regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de la colección solo puede contener letras, números, guiones bajos y guiones.'),
  schemaDefinition: z.string().min(1, 'La definición del esquema es obligatoria.'),
  icon: z.string().optional(),
});

export async function createCollectionAction(prevState: any, formData: FormData) {
  if (!isFirebaseLive()) {
    return {
        message: "Acción fallida: La aplicación está en modo demo. Cambia a modo real para crear colecciones.",
        success: false,
    };
  }

  const validatedFields = createCollectionSchema.safeParse({
    collectionName: formData.get('collectionName'),
    schemaDefinition: formData.get('schemaDefinition'),
    icon: formData.get('icon'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validación fallida. Por favor, revisa los campos.',
      success: false,
    };
  }

  const { collectionName, schemaDefinition, icon } = validatedFields.data;

  try {
    const schemaDocRef = firestoreAdmin!.collection('_schemas').doc(collectionName);
    const doc = await schemaDocRef.get();
    if (doc.exists) {
        return { message: `La colección '${collectionName}' ya existe.`, success: false };
    }

    await schemaDocRef.set({
      definition: schemaDefinition,
      icon: icon || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath('/collections');
    revalidatePath(`/collections/${collectionName}`);

    return {
        success: true,
        message: `Colección '${collectionName}' creada con éxito.`,
        redirectUrl: `/collections/${collectionName}`,
        errors: null,
    };
  } catch (error) {
    console.error("Error al crear la colección en Firestore:", error);
    return {
      message: `No se pudo crear la colección. Por favor, revisa los logs del servidor y la configuración de Firebase.`,
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
  if (!isFirebaseLive()) {
    return { message: "Acción fallida: La aplicación está en modo demo.", success: false };
  }

  const validatedFields = updateUserRoleSchema.safeParse({
    uid: formData.get('uid'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validación fallida.',
      success: false,
    };
  }
  
  const { uid, role } = validatedFields.data;
  
  try {
    await authAdmin!.setCustomUserClaims(uid, { role });
    revalidatePath('/authentication');
    return { message: `Rol actualizado a ${role} con éxito.`, success: true };
  } catch (error) {
    return { message: `No se pudo actualizar el rol: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
  }
}

export async function sendPasswordResetAction(email: string) {
    if (!isFirebaseLive()) {
        return { message: "Acción fallida: La aplicación está en modo demo.", success: false };
    }
    try {
        await authAdmin!.generatePasswordResetLink(email);
        return { message: `Restablecimiento de contraseña iniciado con éxito para ${email}.`, success: true };
    } catch (error) {
        return { message: `No se pudo enviar el restablecimiento de contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}


export async function toggleUserStatusAction(uid: string, isDisabled: boolean) {
    if (!isFirebaseLive()) {
        return { message: "Acción fallida: La aplicación está en modo demo.", success: false };
    }
    try {
        await authAdmin!.updateUser(uid, { disabled: isDisabled });
        revalidatePath('/authentication');
        const status = isDisabled ? "deshabilitado" : "habilitado";
        return { message: `Usuario ${status} con éxito.`, success: true };
    } catch (error) {
        return { message: `No se pudo actualizar el estado del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}

// Document Management Actions

export async function duplicateDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseLive()) {
        return { message: "Acción fallida: La aplicación está en modo demo.", success: false };
    }
    try {
        const docRef = firestoreAdmin!.collection(collectionId).doc(documentId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return { message: `Documento con ID ${documentId} no encontrado.`, success: false };
        }
        const data = docSnap.data();
        await firestoreAdmin!.collection(collectionId).add(data!);
        revalidatePath(`/collections/${collectionId}`);
        return { message: `Documento duplicado con éxito.`, success: true };
    } catch (error) {
        return { message: `No se pudo duplicar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}

export async function deleteDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseLive()) {
        return { message: "Acción fallida: La aplicación está en modo demo.", success: false };
    }
    try {
        await firestoreAdmin!.collection(collectionId).doc(documentId).delete();
        revalidatePath(`/collections/${collectionId}`);
        return { message: `Documento eliminado con éxito.`, success: true };
    } catch (error) {
        return { message: `No se pudo eliminar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}

export async function getDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseLive()) {
        console.warn("Firebase no está en modo real. Devolviendo datos de ejemplo para getDocumentAction.");
        const collectionData = mockData[collectionId] || [];
        const document = collectionData.find(doc => doc.id === documentId);
        if (!document) {
            return { data: null, error: "Documento no encontrado en los datos de ejemplo." };
        }
        return { data: document, error: null };
    }

    try {
        const docRef = firestoreAdmin!.collection(collectionId).doc(documentId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return { data: null, error: "Documento no encontrado." };
        }
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } catch (error) {
        return { data: null, error: `No se pudo obtener el documento: ${error instanceof Error ? error.message : 'Error desconocido'}` };
    }
}

export async function updateDocumentAction(prevState: any, formData: FormData) {
    if (!isFirebaseLive()) {
        return { message: "Acción fallida: La aplicación está en modo demo.", success: false };
    }

    const collectionId = formData.get('collectionId') as string;
    const documentId = formData.get('documentId') as string;

    if (!collectionId || !documentId) {
        return { message: "Se requieren el ID de la colección y el ID del documento.", success: false };
    }

    try {
        const docRef = firestoreAdmin!.collection(collectionId).doc(documentId);
        const originalDocSnap = await docRef.get();
        if (!originalDocSnap.exists) {
            return { message: "Documento no encontrado.", success: false };
        }
        const originalData = originalDocSnap.data()!;
        
        const dataToUpdate: { [key: string]: any } = {};
        
        // This handles fields that might not be in the form but are in the original document
        const allKeys = new Set([...Object.keys(originalData), ...Array.from(formData.keys())]);

        allKeys.forEach(key => {
             if (key === 'collectionId' || key === 'documentId') return;

            const formValue = formData.get(key) as string | null;
            const originalValue = originalData[key];

             if (formData.has(key)) {
                if (typeof originalValue === 'number') {
                    dataToUpdate[key] = Number(formValue);
                } else if (typeof originalValue === 'boolean') {
                    dataToUpdate[key] = formValue === 'on'; // HTML checkbox sends 'on' when checked
                } else if (originalValue && typeof originalValue.toDate === 'function') { // Firestore Timestamp
                    dataToUpdate[key] = formValue ? admin.firestore.Timestamp.fromDate(new Date(formValue)) : null;
                } else if (originalValue instanceof Date) {
                     dataToUpdate[key] = formValue ? new Date(formValue) : null;
                }
                else {
                    dataToUpdate[key] = formValue;
                }
            } else if (typeof originalValue === 'boolean') {
                // If a checkbox is not in form data, it was unchecked.
                 dataToUpdate[key] = false;
            }
        });
        
        await docRef.update(dataToUpdate);

        revalidatePath(`/collections/${collectionId}`);
        revalidatePath(`/collections/${collectionId}/${documentId}/edit`);
        revalidatePath(`/collections/posts/edit/${documentId}`); // Also revalidate custom editor
        return { message: `Documento '${documentId}' actualizado con éxito.`, success: true };

    } catch (error) {
        return { message: `No se pudo actualizar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}

const writingAssistantSchema = z.object({
    action: z.enum(['generate', 'paraphrase', 'summarize', 'expand', 'changeTone']),
    topic: z.string().optional(),
    currentContent: z.string().optional(),
    selectedText: z.string().optional(),
    tone: z.enum(['Professional', 'Casual', 'Humorous']).optional(),
  });
  
  export async function writingAssistantAction(input: WritingAssistantInput) {
      const validatedFields = writingAssistantSchema.safeParse(input);
  
      if (!validatedFields.success) {
          const errors = validatedFields.error.flatten().fieldErrors;
          const errorMessage = Object.values(errors).flat().join(', ');
          return {
              error: "Validación fallida: " + errorMessage,
              draft: null,
          };
      }
      
      try {
          const result = await writingAssistant(validatedFields.data);
          return { draft: result.draft, error: null };
      } catch (error) {
          return {
              draft: null,
              error: `Ocurrió un error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          };
      }
  }

export async function uploadFileAction(formData: FormData, folder: string) {
    if (!isFirebaseLive()) {
        const isCover = folder === 'covers';
        const placeholderUrl = isCover ? 'https://placehold.co/1200x630.png' : 'https://placehold.co/800x600.png';
        return { success: true, url: placeholderUrl };
    }

    if (!storageAdmin) {
        return { success: false, error: "El almacenamiento de Firebase no está configurado." };
    }

    const file = formData.get('file') as File | null;
    if (!file) {
        return { success: false, error: "No se encontró ningún archivo." };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        
        const bucket = storageAdmin.bucket();
        const fileUpload = bucket.file(filename);

        await fileUpload.save(buffer, {
            metadata: { contentType: file.type },
        });

        await fileUpload.makePublic();
        
        return { success: true, url: fileUpload.publicUrl() };

    } catch (error) {
        console.error("Error al subir el archivo:", error);
        return { success: false, error: `No se pudo subir el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}` };
    }
}
