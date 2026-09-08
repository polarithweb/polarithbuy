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
import type { Book } from '../data/booksData';
import { formatRupeePrice } from '../utils/price';

const BOOKS_COLLECTION = 'books';

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

export function subscribeBooks(onUpdate: (books: Book[]) => void): () => void {
  try {
    const booksRef = collection(db, BOOKS_COLLECTION);

    const unsubscribe = onSnapshot(
      booksRef,
      (snapshot) => {
        const items: Book[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAtStr = '';
          if (data.createdAt?.toDate) {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }

          return {
            id: docSnap.id,
            title: data.title || 'Untitled Product',
            type: data.type || data.category || 'General',
            author: data.author || 'Polarith Editorial',
            price: formatRupeePrice(data.price, 499),
            rating: data.rating || 5.0,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            inStock: data.inStock ?? true,
            cashOnDeliveryEligible: data.cashOnDeliveryEligible !== undefined ? Boolean(data.cashOnDeliveryEligible) : true,
            createdAt: createdAtStr,
          };
        });

        // Sort descending by creation date safely in client
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
          console.warn(`Firestore [LIST] at ${BOOKS_COLLECTION} reconnecting:`, errMessage);
          return;
        }
        try {
          handleFirestoreError(error, OperationType.LIST, BOOKS_COLLECTION);
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
        handleFirestoreError(err, OperationType.LIST, BOOKS_COLLECTION);
      } catch {
        // Handled
      }
    }
    return () => {};
  }
}

export async function createBook(bookData: {
  title: string;
  type: string;
  author?: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  cashOnDeliveryEligible?: boolean;
}): Promise<string> {
  try {
    const booksRef = collection(db, BOOKS_COLLECTION);
    const docRef = await addDoc(booksRef, {
      title: bookData.title.trim(),
      type: bookData.type.trim(),
      author: bookData.author?.trim() || 'Polarith Editorial',
      price: formatRupeePrice(bookData.price, 499),
      rating: 5.0,
      description: bookData.description?.trim() || '',
      imageUrl: bookData.imageUrl || '',
      inStock: true,
      cashOnDeliveryEligible: bookData.cashOnDeliveryEligible !== undefined ? bookData.cashOnDeliveryEligible : true,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, BOOKS_COLLECTION);
    throw err;
  }
}

export async function updateBook(
  bookId: string, 
  bookData: {
    title: string;
    type: string;
    author?: string;
    price?: string;
    description?: string;
    imageUrl?: string;
    cashOnDeliveryEligible?: boolean;
  }
): Promise<void> {
  try {
    const docRef = doc(db, BOOKS_COLLECTION, bookId);
    await updateDoc(docRef, {
      title: bookData.title.trim(),
      type: bookData.type.trim(),
      author: bookData.author?.trim() || 'Polarith Editorial',
      price: formatRupeePrice(bookData.price, 499),
      description: bookData.description?.trim() || '',
      imageUrl: bookData.imageUrl || '',
      cashOnDeliveryEligible: bookData.cashOnDeliveryEligible !== undefined ? bookData.cashOnDeliveryEligible : true,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${BOOKS_COLLECTION}/${bookId}`);
    throw err;
  }
}

export async function removeBook(bookId: string): Promise<void> {
  try {
    const docRef = doc(db, BOOKS_COLLECTION, bookId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${BOOKS_COLLECTION}/${bookId}`);
    throw err;
  }
}

