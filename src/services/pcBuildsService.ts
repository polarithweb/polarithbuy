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
import type { PcBuild } from '../data/pcBuildsData';
import { formatRupeePrice } from '../utils/price';

const PC_BUILDS_COLLECTION = 'pc_builds';

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

export function subscribePcBuilds(onUpdate: (builds: PcBuild[]) => void): () => void {
  try {
    const buildsRef = collection(db, PC_BUILDS_COLLECTION);

    const unsubscribe = onSnapshot(
      buildsRef,
      (snapshot) => {
        const items: PcBuild[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAtStr = '';
          if (data.createdAt?.toDate) {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }

          return {
            id: docSnap.id,
            title: data.title || 'Untitled PC Build',
            category: data.category || 'Gaming',
            specs: data.specs || '',
            price: formatRupeePrice(data.price, 49999),
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
          console.warn(`Firestore [LIST] at ${PC_BUILDS_COLLECTION} reconnecting:`, errMessage);
          return;
        }
        try {
          handleFirestoreError(error, OperationType.LIST, PC_BUILDS_COLLECTION);
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
        handleFirestoreError(err, OperationType.LIST, PC_BUILDS_COLLECTION);
      } catch {
        // Handled
      }
    }
    return () => {};
  }
}

export async function createPcBuild(buildData: {
  title: string;
  category: string;
  specs?: string;
  price?: string;
  description?: string;
  imageUrl?: string;
}): Promise<string> {
  try {
    const buildsRef = collection(db, PC_BUILDS_COLLECTION);
    const docRef = await addDoc(buildsRef, {
      title: buildData.title.trim(),
      category: buildData.category.trim(),
      specs: buildData.specs?.trim() || '',
      price: formatRupeePrice(buildData.price, 49999),
      rating: 5.0,
      description: buildData.description?.trim() || '',
      imageUrl: buildData.imageUrl || '',
      inStock: true,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, PC_BUILDS_COLLECTION);
    throw err;
  }
}

export async function updatePcBuild(
  buildId: string, 
  buildData: {
    title: string;
    category: string;
    specs?: string;
    price?: string;
    description?: string;
    imageUrl?: string;
  }
): Promise<void> {
  try {
    const docRef = doc(db, PC_BUILDS_COLLECTION, buildId);
    await updateDoc(docRef, {
      title: buildData.title.trim(),
      category: buildData.category.trim(),
      specs: buildData.specs?.trim() || '',
      price: formatRupeePrice(buildData.price, 49999),
      description: buildData.description?.trim() || '',
      imageUrl: buildData.imageUrl || '',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${PC_BUILDS_COLLECTION}/${buildId}`);
    throw err;
  }
}

export async function removePcBuild(buildId: string): Promise<void> {
  try {
    const docRef = doc(db, PC_BUILDS_COLLECTION, buildId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PC_BUILDS_COLLECTION}/${buildId}`);
    throw err;
  }
}
