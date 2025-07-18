



"use server";

import { generateSchemaSuggestion } from "@/ai/flows/generate-schema-suggestion";
import { generateSummary } from "@/ai/flows/generate-summary";
import { writingAssistant, type WritingAssistantInput } from "@/ai/flows/writing-assistant";
import { z, ZodError } from "zod";
import { authAdmin, firestoreAdmin, storageAdmin, isFirebaseConfigured } from "./firebase-admin";
import { revalidatePath } from "next/cache";
import admin from 'firebase-admin';
import { generateAnalyticsAdvice, type AnalyticsAdviceInput } from "@/ai/flows/generate-analytics-advice";
import { generateCollectionIdeas } from "@/ai/flows/generate-collection-ideas";
import { getCollectionSchema, getCollections } from "./data";


// #region AI Helper Actions

async function getZodSchemaFromString(collectionId: string): Promise<z.ZodObject<any, any, any> | null> {
    if (!isFirebaseConfigured) return null;
    try {
        const { definition } = await getCollectionSchema(collectionId);
        if (!definition) return null;
        
        // This regex is safer than using new Function on the whole file content.
        const match = definition.match(/z\.object\({[\s\S]*?}\)/);
        let schemaString: string;
        
        if (match?.[0]) {
            schemaString = match[0];
        } else if (definition.trim().startsWith('z.object')) {
            // Fallback for schemas that are just the object definition.
            schemaString = definition;
        } else {
            console.error(`La definición del esquema para '${collectionId}' no parece ser un objeto de Zod válido.`);
            return null;
        }

        // IMPORTANT: Using new Function() can be risky if the schema string is not trusted.
        // In this app, schemas are editable only by admins, so the risk is contained.
        const schema = new Function('z', `return ${schemaString}`)(z);
        if (schema && typeof schema.parse === 'function') {
            return schema;
        }
        return null;
    } catch (e) {
        console.error(`Falló al analizar el esquema para la colección '${collectionId}':`, String(e));
        return null;
    }
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

export async function getAnalyticsAdviceAction(analyticsData: AnalyticsAdviceInput) {
    try {
        const result = await generateAnalyticsAdvice(analyticsData);
        return {
            advice: result.advice,
            error: null,
        };
    } catch (error) {
        return {
            advice: null,
            error: `Ocurrió un error al generar el consejo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        };
    }
}


export async function getCollectionIdeasAction(collectionName: string) {
  let documents: any[];

  try {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { ideas: null, error: "Firebase no está configurado para obtener documentos." };
    }
      
    const snapshot = await firestoreAdmin.collection(collectionName).limit(5).get();
    documents = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    
    if (documents.length === 0) {
        return { ideas: null, error: "No hay documentos en esta colección para generar ideas." };
    }
    
    // To keep the prompt clean and focused, we'll only send a few key fields.
    const relevantKeys = ['title', 'name', 'description', 'category', 'tags', 'topic'];
    const sampleData = documents.map(doc => {
      let sampleDoc: {[key: string]: any} = {};
      for (const key of relevantKeys) {
        if(doc[key]) {
            sampleDoc[key] = doc[key];
        }
      }
      // If no 'relevant' keys were found, create a sample from any non-object/array fields.
      if (Object.keys(sampleDoc).length === 0) {
        Object.keys(doc).forEach(key => {
            if (typeof doc[key] !== 'object' && key !== 'id') {
                sampleDoc[key] = doc[key];
            }
        })
      }
      return sampleDoc;
    });

    const result = await generateCollectionIdeas({
        collectionName,
        documentsJson: JSON.stringify(sampleData.filter(d => Object.keys(d).length > 0), null, 2),
    });

    return {
        ideas: result.ideas,
        error: null,
    };
  } catch (error) {
    console.error("Error generating collection ideas:", String(error));
    return {
        ideas: null,
        error: `Ocurrió un error al generar ideas: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
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

// #endregion

// #region Schema and Collection Actions

const updateSchemaSchema = z.object({
  collectionId: z.string(),
  schemaDefinition: z.string().min(1, { message: "El esquema no puede estar vacío." }),
  icon: z.string().optional(),
});

export async function updateSchemaAction(prevState: any, formData: FormData) {
  if (!isFirebaseConfigured || !firestoreAdmin) {
    return {
        errors: null,
        message: "Acción fallida: Firebase no está configurado.",
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
    const schemaDocRef = firestoreAdmin.collection('_schemas').doc(collectionId);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error al actualizar el esquema en Firestore:", errorMessage);
    return {
      errors: null,
      message: `No se pudo actualizar el esquema en Firestore: ${errorMessage}`,
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
  if (!isFirebaseConfigured || !firestoreAdmin) {
    return {
        message: "Acción fallida: Firebase no está configurado.",
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
    const schemaDocRef = firestoreAdmin.collection('_schemas').doc(collectionName);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error al crear la colección en Firestore:", errorMessage);
    return {
      message: `No se pudo crear la colección: ${errorMessage}`,
      success: false,
    };
  }
}

export async function getSchemaFieldsAction(collectionId: string): Promise<{ fields: { name: string; type: string }[] | null; error: string | null }> {
    if (!isFirebaseConfigured) {
        return { fields: null, error: "Firebase no está configurado." };
    }
    try {
        const schema = await getZodSchemaFromString(collectionId);
        if (!schema) {
            return { fields: null, error: `No se pudo encontrar o analizar un esquema válido para la colección '${collectionId}'. Asegúrate de que existe en la colección '_schemas' y tiene un formato correcto.` };
        }
        const fields = Object.entries(schema.shape).map(([name, zodType]) => ({
            name,
            type: (zodType as any)._def.typeName as string,
        }));
        return { fields, error: null };
    } catch (error) {
        return { fields: null, error: `Ocurrió un error al procesar el esquema: ${String(error)}` };
    }
}


// #endregion

// #region User Management Actions
const createUserSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  displayName: z.string().min(1, { message: "El nombre es obligatorio." }),
  role: z.enum(["Admin", "Editor", "Viewer"]),
});

export async function createUserAction(prevState: any, formData: FormData) {
  if (!isFirebaseConfigured || !authAdmin) {
    return { message: "Acción fallida: Firebase Auth no está configurado.", success: false, errors: {} };
  }

  const validatedFields = createUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validación fallida.',
      success: false,
    };
  }

  const { email, password, displayName, role } = validatedFields.data;

  try {
    const userRecord = await authAdmin.createUser({
      email,
      password,
      displayName,
    });
    
    await authAdmin.setCustomUserClaims(userRecord.uid, { role });

    revalidatePath('/authentication');
    return { message: `Usuario ${displayName} creado con éxito.`, success: true, errors: {} };
  } catch (error) {
    const firebaseError = error as { code?: string; message: string };
    let errorMessage = `No se pudo crear el usuario: ${firebaseError.message || 'Error desconocido'}`;
    if (firebaseError.code === 'auth/email-already-exists') {
        errorMessage = 'Este correo electrónico ya está en uso.';
    }
    return { message: errorMessage, success: false, errors: {} };
  }
}

const updateUserRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(["Admin", "Editor", "Viewer"]),
});

export async function updateUserRoleAction(prevState: any, formData: FormData) {
  if (!isFirebaseConfigured || !authAdmin) {
    return { message: "Acción fallida: Firebase Auth no está configurado.", success: false };
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
    await authAdmin.setCustomUserClaims(uid, { role });
    revalidatePath('/authentication');
    return { message: `Rol actualizado a ${role} con éxito.`, success: true };
  } catch (error) {
    return { message: `No se pudo actualizar el rol: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
  }
}

export async function sendPasswordResetAction(email: string) {
    if (!isFirebaseConfigured || !authAdmin) {
        return { message: "Acción fallida: Firebase Auth no está configurado.", success: false };
    }
    try {
        await authAdmin.generatePasswordResetLink(email);
        return { message: `Restablecimiento de contraseña iniciado con éxito para ${email}.`, success: true };
    } catch (error) {
        return { message: `No se pudo enviar el restablecimiento de contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}


export async function toggleUserStatusAction(uid: string, isDisabled: boolean) {
    if (!isFirebaseConfigured || !authAdmin) {
        return { message: "Acción fallida: Firebase Auth no está configurado.", success: false };
    }
    try {
        await authAdmin.updateUser(uid, { disabled: isDisabled });
        revalidatePath('/authentication');
        const status = isDisabled ? "deshabilitado" : "habilitado";
        return { message: `Usuario ${status} con éxito.`, success: true };
    } catch (error) {
        return { message: `No se pudo actualizar el estado del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}
// #endregion

// #region Document Management Actions

export async function createDocumentAction(prevState: any, formData: FormData) {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { message: "Acción fallida: Firebase Firestore no está configurado.", success: false, redirectUrl: null, errors: null };
    }

    const collectionId = formData.get('collectionId') as string;
    if (!collectionId) {
        return { message: "Se requiere el ID de la colección.", success: false, redirectUrl: null, errors: null };
    }

    const schema = await getZodSchemaFromString(collectionId);
    
    // Fallback for collections without a schema (e.g., legacy or unmanaged)
    if (!schema) {
        const dataToCreate: { [key: string]: any } = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'collectionId' && !key.startsWith('$ACTION_ID')) {
                dataToCreate[key] = value;
            }
        }
        dataToCreate.createdAt = admin.firestore.Timestamp.now();
        dataToCreate.updatedAt = admin.firestore.Timestamp.now();

        try {
            const docRef = await firestoreAdmin.collection(collectionId).add(dataToCreate);
            revalidatePath(`/collections/${collectionId}`);
            return {
                success: true,
                message: `Documento creado con éxito en '${collectionId}' (sin validación de esquema).`,
                redirectUrl: `/collections/${collectionId}/${docRef.id}/edit`,
                errors: null,
            };
        } catch (error) {
             return { message: `No se pudo crear el documento (sin esquema): ${String(error)}`, success: false, redirectUrl: null, errors: null };
        }
    }

    const rawData: { [key: string]: any } = {};
    formData.forEach((value, key) => {
        if (key !== 'collectionId' && !key.startsWith('$ACTION_ID')) {
            rawData[key] = value;
        }
    });

    Object.keys(schema.shape).forEach(key => {
        const fieldDef = schema.shape[key]._def;
        if (fieldDef.typeName === 'ZodBoolean') {
            rawData[key] = formData.has(key) && formData.get(key) === 'on';
        } else if (fieldDef.typeName === 'ZodArray') {
            if (typeof rawData[key] === 'string') {
                rawData[key] = rawData[key] ? rawData[key].split(',').map((item: string) => item.trim()).filter(Boolean) : [];
            }
        }
    });

    try {
        // Use safeParse to get detailed error messages
        const parsed = schema.safeParse(rawData);
        if (!parsed.success) {
            return {
                message: "Falló la validación. Revisa los campos.",
                success: false,
                errors: parsed.error.flatten().fieldErrors,
                redirectUrl: null,
            };
        }

        const dataToCreate = {
            ...parsed.data,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
        };

        const docRef = await firestoreAdmin.collection(collectionId).add(dataToCreate);
        
        revalidatePath(`/collections/${collectionId}`);
        if(collectionId === 'projects') { revalidatePath('/proyectos'); revalidatePath('/'); }
        if(collectionId === 'posts') { revalidatePath('/blog'); revalidatePath('/'); }

        return {
            success: true,
            message: `Documento creado con éxito en '${collectionId}'.`,
            redirectUrl: `/collections/${collectionId}/${docRef.id}/edit`,
            errors: null,
        };
    } catch (error) {
        if (error instanceof ZodError) {
             return { message: "Error de validación de Zod.", success: false, errors: error.flatten().fieldErrors, redirectUrl: null };
        }
        console.error("Error al crear el documento:", String(error));
        return { 
            message: `No se pudo crear el documento: ${String(error)}`, 
            success: false,
            redirectUrl: null,
            errors: null
        };
    }
}


export async function duplicateDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { message: "Acción fallida: Firebase Firestore no está configurado.", success: false };
    }
    try {
        const docRef = firestoreAdmin.collection(collectionId).doc(documentId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return { message: `Documento con ID ${documentId} no encontrado.`, success: false };
        }
        const data = docSnap.data();
        await firestoreAdmin.collection(collectionId).add(data!);
        revalidatePath(`/collections/${collectionId}`);
        return { message: `Documento duplicado con éxito.`, success: true };
    } catch (error) {
        return { message: `No se pudo duplicar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}

export async function deleteDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { message: "Acción fallida: Firebase Firestore no está configurado.", success: false };
    }
    try {
        await firestoreAdmin.collection(collectionId).doc(documentId).delete();
        revalidatePath(`/collections/${collectionId}`);
        return { message: `Documento eliminado con éxito.`, success: true };
    } catch (error) {
        return { message: `No se pudo eliminar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`, success: false };
    }
}

export async function getDocumentAction(collectionId: string, documentId: string) {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { data: null, error: "Firebase no está configurado." };
    }

    try {
        const docRef = firestoreAdmin.collection(collectionId).doc(documentId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return { data: null, error: "Documento no encontrado." };
        }
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } catch (error) {
        return { data: null, error: `No se pudo obtener el documento: ${String(error)}` };
    }
}

export async function updateDocumentAction(prevState: any, formData: FormData) {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { message: "Acción fallida: Firebase Firestore no está configurado.", success: false };
    }

    const collectionId = formData.get('collectionId') as string;
    const documentId = formData.get('documentId') as string;

    if (!collectionId || !documentId) {
        return { message: "Se requieren el ID de la colección y el ID del documento.", success: false };
    }

    try {
        const docRef = firestoreAdmin.collection(collectionId).doc(documentId);
        const originalDocSnap = await docRef.get();
        if (!originalDocSnap.exists) {
            return { message: "Documento no encontrado.", success: false };
        }
        const originalData = originalDocSnap.data()!;
        
        const dataToUpdate: { [key: string]: any } = {};
        
        const allKeys = new Set([...Object.keys(originalData), ...Array.from(formData.keys())]);

        allKeys.forEach(key => {
             if (key === 'collectionId' || key === 'documentId' || key.startsWith('$ACTION_ID')) return;

            const formValue = formData.get(key) as string | null;
            const originalValue = originalData[key];

             if (formData.has(key)) {
                if (Array.isArray(originalValue) && typeof formValue === 'string') {
                    // Handle comma-separated strings into an array of strings
                    dataToUpdate[key] = formValue ? formValue.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                } else if (typeof originalValue === 'number') {
                    dataToUpdate[key] = Number(formValue);
                } else if (typeof originalValue === 'boolean') {
                    dataToUpdate[key] = formValue === 'on';
                } else if (originalValue && typeof originalValue.toDate === 'function') {
                    dataToUpdate[key] = formValue ? admin.firestore.Timestamp.fromDate(new Date(formValue)) : null;
                } else if (originalValue instanceof Date) {
                     dataToUpdate[key] = formValue ? new Date(formValue) : null;
                }
                else {
                    dataToUpdate[key] = formValue;
                }
            } else if (typeof originalValue === 'boolean') {
                 dataToUpdate[key] = false;
            }
        });

        dataToUpdate.updatedAt = admin.firestore.Timestamp.now();
        
        await docRef.update(dataToUpdate);

        revalidatePath(`/collections/${collectionId}`);
        revalidatePath(`/collections/${collectionId}/${documentId}/edit`);
        revalidatePath(`/collections/posts/edit/${documentId}`);
        revalidatePath('/blog'); // Revalidate blog index page
        revalidatePath(`/blog/${documentId}`);
        revalidatePath('/proyectos'); // Revalidate projects index page
        revalidatePath(`/proyectos/${documentId}`); // Revalidate project detail page
        revalidatePath('/'); // Revalidate homepage
        return { message: `Documento '${documentId}' actualizado con éxito.`, success: true };

    } catch (error) {
        return { message: `No se pudo actualizar el documento: ${String(error)}`, success: false };
    }
}
// #endregion

// #region Storage Actions
export async function uploadFileAction(formData: FormData) {
    if (!isFirebaseConfigured || !storageAdmin) {
        return { success: false, error: "El almacenamiento de Firebase no está configurado." };
    }

    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'general';
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

        const [signedUrl] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: '01-01-2100',
        });

        // Revalidate the storage path to show the new file immediately
        revalidatePath('/storage', 'layout');

        return { success: true, url: signedUrl, error: null };

    } catch (error) {
        console.error("Error al subir el archivo:", String(error));
        return { success: false, error: `No se pudo subir el archivo: ${String(error)}` };
    }
}

export async function deleteFileAction(filePath: string) {
    if (!isFirebaseConfigured || !storageAdmin) {
        return { success: false, error: "El almacenamiento de Firebase no está configurado." };
    }

    try {
        const bucket = storageAdmin.bucket();
        await bucket.file(filePath).delete();
        revalidatePath('/storage', 'layout');
        return { success: true, message: "Archivo eliminado con éxito." };
    } catch (error) {
        console.error("Error al eliminar el archivo:", String(error));
        return { success: false, error: `No se pudo eliminar el archivo: ${String(error)}` };
    }
}

export async function createFolderAction(folderPath: string) {
    if (!isFirebaseConfigured || !storageAdmin) {
        return { success: false, error: "El almacenamiento de Firebase no está configurado." };
    }
    
    // In Firebase Storage, folders are created implicitly by creating a file inside them.
    // We create a hidden placeholder file to "create" the folder.
    const placeholderFileName = `${folderPath}/.placeholder`;

    try {
        const bucket = storageAdmin.bucket();
        const file = bucket.file(placeholderFileName);
        await file.save('', { contentType: 'application/octet-stream' });
        
        revalidatePath('/storage', 'layout');
        return { success: true, message: `Carpeta '${folderPath}' creada con éxito.` };
    } catch (error) {
        console.error("Error al crear la carpeta:", String(error));
        return { success: false, error: `No se pudo crear la carpeta: ${String(error)}` };
    }
}
// #endregion

// #region Debug Actions
export async function checkFirestoreConnectionAction() {
  if (!isFirebaseConfigured) {
    return { success: false, message: 'Firebase Admin SDK no está configurado. Revisa tus variables de entorno.', code: 'sdk-not-configured' };
  }
  if (!firestoreAdmin) {
    return { success: false, message: 'La instancia de Firestore Admin no está disponible.', code: 'firestore-not-initialized' };
  }

  try {
    // Perform a simple read operation to check connectivity and permissions
    await firestoreAdmin.collection('_internal_test').doc('connection_check').get();
    return { success: true, message: 'La conexión con Firestore se ha establecido correctamente.', code: 'ok' };
  } catch (error: any) {
    return {
      success: false,
      message: `Falló la operación de lectura en Firestore: ${error.message}`,
      code: error.code || 'unknown-error',
    };
  }
}

export async function getCollectionsForDebugAction() {
    const logs: { message: string, type: 'info' | 'success' | 'error' }[] = [];
    
    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        logs.push({ message, type });
    };

    addLog('Iniciando getCollectionsForDebugAction...');
    if (!isFirebaseConfigured) {
        addLog('isFirebaseConfigured es false.', 'error');
        return { success: false, collections: null, logs };
    }
    addLog('isFirebaseConfigured es true.', 'success');

    if (!firestoreAdmin) {
        addLog('firestoreAdmin es nulo.', 'error');
        return { success: false, collections: null, logs };
    }
    addLog('firestoreAdmin está inicializado.', 'success');
    
    try {
        const collections = await getCollections();
        addLog(`getCollections devolvió ${collections.length} colecciones.`, 'success');
        return { success: true, collections, logs };
    } catch (error: any) {
        addLog(`Error al llamar a getCollections: ${error.message}`, 'error');
        return { success: false, collections: null, logs };
    }
}
// #endregion
