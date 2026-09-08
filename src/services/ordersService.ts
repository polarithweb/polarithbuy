import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CustomerOrder, OrderItem } from '../types';
import { formatRupeePrice, formatIndianCurrency } from '../utils/price';

const ORDERS_COLLECTION = 'orders';

export function subscribeOrders(onUpdate: (orders: CustomerOrder[]) => void): () => void {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const items: CustomerOrder[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAtStr = '';
          if (data.createdAt?.toDate) {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          } else {
            createdAtStr = new Date().toISOString();
          }

          return {
            id: docSnap.id,
            orderNumber: data.orderNumber || `ORD-${docSnap.id.slice(0, 6).toUpperCase()}`,
            customerName: data.customerName || 'Anonymous Customer',
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            pinCode: data.pinCode || '',
            items: ((data.items || []) as OrderItem[]).map((itm) => ({
              ...itm,
              price: formatRupeePrice(itm.price, itm.numericPrice),
            })),
            itemCount: data.itemCount || (data.items ? data.items.length : 0),
            totalAmount: Number(data.totalAmount) || 0,
            formattedTotal: formatIndianCurrency(Number(data.totalAmount) || 0),
            paymentMode: data.paymentMode || 'Cash on Delivery',
            status: data.status || 'New',
            createdAt: createdAtStr,
            notes: data.notes || '',
          };
        });

        // Sort descending by creation date
        items.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.localeCompare(a.createdAt);
        });

        onUpdate(items);
      },
      (error) => {
        console.warn(`Firestore orders listener notice:`, error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`Could not subscribe to orders:`, err);
    return () => {};
  }
}

export async function createCustomerOrder(orderInput: {
  customerName: string;
  phoneNumber: string;
  address: string;
  pinCode: string;
  items: OrderItem[];
  totalAmount: number;
  formattedTotal: string;
  paymentMode: 'Cash on Delivery' | 'Prepaid (UPI / Online)';
  notes?: string;
}): Promise<{ id: string; orderNumber: string }> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const docRef = await addDoc(ordersRef, {
      orderNumber,
      customerName: orderInput.customerName.trim(),
      phoneNumber: orderInput.phoneNumber.trim(),
      address: orderInput.address.trim(),
      pinCode: orderInput.pinCode.trim(),
      items: orderInput.items,
      itemCount: orderInput.items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: orderInput.totalAmount,
      formattedTotal: orderInput.formattedTotal,
      paymentMode: orderInput.paymentMode,
      status: 'New',
      notes: orderInput.notes ? orderInput.notes.trim() : '',
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      orderNumber,
    };
  } catch (err) {
    console.error('Failed to create customer order in Firestore:', err);
    throw err;
  }
}

export async function updateOrderStatus(orderId: string, status: CustomerOrder['status']): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error(`Failed to update order ${orderId}:`, err);
    throw err;
  }
}

export async function deleteCustomerOrder(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (err) {
    console.error(`Failed to delete order ${orderId}:`, err);
    throw err;
  }
}
