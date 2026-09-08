import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Accessory } from '../data/accessoriesData';
import { formatRupeePrice } from '../utils/price';

const ACCESSORIES_COLLECTION = 'accessories';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function subscribeAccessories(onUpdate: (accessories: Accessory[]) => void): () => void {
  try {
    const accRef = collection(db, ACCESSORIES_COLLECTION);

    const unsubscribe = onSnapshot(
      accRef,
      (snapshot) => {
        const items: Accessory[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAtStr = '';
          if (data.createdAt?.toDate) {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }

          return {
            id: docSnap.id,
            title: data.title || 'Untitled Accessory',
            category: data.category || 'Earbuds',
            brand: data.brand || '',
            price: formatRupeePrice(data.price, 1499),
            rating: data.rating || 5.0,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            inStock: data.inStock ?? true,
            createdAt: createdAtStr,
          };
        });

        // Client-side sort descending by creation date
        items.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.localeCompare(a.createdAt);
        });

        onUpdate(items);
      },
      (error) => {
        const errMessage = error instanceof Error ? error.message : String(error);
        if (errMessage.includes('unavailable') || errMessage.includes('client is offline')) {
          console.warn(`Firestore [LIST] at ${ACCESSORIES_COLLECTION} reconnecting:`, errMessage);
          return;
        }
        try {
          handleFirestoreError(error, OperationType.LIST, ACCESSORIES_COLLECTION);
        } catch {
          // Handled
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    if (!errMessage.includes('unavailable') && !errMessage.includes('client is offline')) {
      try {
        handleFirestoreError(err, OperationType.LIST, ACCESSORIES_COLLECTION);
      } catch {
        // Handled
      }
    }
    return () => {};
  }
}

export async function createAccessory(accessoryData: {
  title: string;
  category: string;
  brand?: string;
  price?: string;
  description?: string;
  imageUrl?: string;
}): Promise<string> {
  try {
    const accRef = collection(db, ACCESSORIES_COLLECTION);
    const docRef = await addDoc(accRef, {
      title: accessoryData.title.trim(),
      category: accessoryData.category.trim(),
      brand: accessoryData.brand?.trim() || '',
      price: formatRupeePrice(accessoryData.price, 1499),
      rating: 5.0,
      description: accessoryData.description?.trim() || '',
      imageUrl: accessoryData.imageUrl || '',
      inStock: true,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, ACCESSORIES_COLLECTION);
    throw err;
  }
}

export async function updateAccessory(
  accessoryId: string, 
  accessoryData: {
    title: string;
    category: string;
    brand?: string;
    price?: string;
    description?: string;
    imageUrl?: string;
  }
): Promise<void> {
  try {
    const docRef = doc(db, ACCESSORIES_COLLECTION, accessoryId);
    await updateDoc(docRef, {
      title: accessoryData.title.trim(),
      category: accessoryData.category.trim(),
      brand: accessoryData.brand?.trim() || '',
      price: formatRupeePrice(accessoryData.price, 1499),
      description: accessoryData.description?.trim() || '',
      imageUrl: accessoryData.imageUrl || '',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ACCESSORIES_COLLECTION}/${accessoryId}`);
    throw err;
  }
}

export async function removeAccessory(accessoryId: string): Promise<void> {
  try {
    const docRef = doc(db, ACCESSORIES_COLLECTION, accessoryId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ACCESSORIES_COLLECTION}/${accessoryId}`);
    throw err;
  }
}
