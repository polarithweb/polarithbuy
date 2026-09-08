import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HubButton } from './components/HubButton';
import { Footer } from './components/Footer';
import { BooksHubView } from './components/BooksHubView';
import { BooksAdminPortal } from './components/BooksAdminPortal';
import { PcBuildsHubView } from './components/PcBuildsHubView';
import { PcBuildsAdminPortal } from './components/PcBuildsAdminPortal';
import { AccessoriesHubView } from './components/AccessoriesHubView';
import { AccessoriesAdminPortal } from './components/AccessoriesAdminPortal';
import { OrdersAdminView } from './components/OrdersAdminView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CartButton } from './components/CartButton';
import { HUB_ITEMS } from './data/hubItems';
import { subscribeBooks } from './services/booksService';
import { subscribePcBuilds } from './services/pcBuildsService';
import { subscribeAccessories } from './services/accessoriesService';
import { parseNumericPrice, formatRupeePrice } from './utils/price';
import { SlidersHorizontal } from 'lucide-react';
import type { HubItem, CartItem } from './types';
import type { Book } from './data/booksData';
import type { PcBuild } from './data/pcBuildsData';
import type { Accessory } from './data/accessoriesData';

export default function App() {
  const [activeView, setActiveView] = useState<string>('hub');
  
  // Real-time Firestore State for each department
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [pcBuilds, setPcBuilds] = useState<PcBuild[]>([]);
  const [editingPcBuild, setEditingPcBuild] = useState<PcBuild | null>(null);

  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('polarith_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Synchronize cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('polarith_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart with localStorage:', e);
    }
  }, [cart]);

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    const unsubBooks = subscribeBooks((updatedBooks) => {
      setBooks(updatedBooks);
    });

    const unsubPcBuilds = subscribePcBuilds((updatedBuilds) => {
      setPcBuilds(updatedBuilds);
    });

    const unsubAccessories = subscribeAccessories((updatedAccessories) => {
      setAccessories(updatedAccessories);
    });

    return () => {
      unsubBooks();
      unsubPcBuilds();
      unsubAccessories();
    };
  }, []);

  // Cart Item Handlers
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const handleAddBookToCart = (book: Book) => {
    const rupeeStr = formatRupeePrice(book.price, 499);
    const numPrice = parseNumericPrice(rupeeStr);
    const cartItem: CartItem = {
      id: `book-${book.id}`,
      productId: book.id,
      title: book.title,
      department: 'books',
      departmentName: 'Books',
      price: rupeeStr,
      numericPrice: numPrice || 499,
      imageUrl: book.imageUrl,
      quantity: 1,
      cashOnDeliveryEligible: book.cashOnDeliveryEligible !== false,
      details: book.author ? `Author: ${book.author}` : undefined
    };
    addToCart(cartItem);
  };

  const handleAddPcBuildToCart = (build: PcBuild) => {
    const rupeeStr = formatRupeePrice(build.price, 49999);
    const numPrice = parseNumericPrice(rupeeStr);
    const cartItem: CartItem = {
      id: `pc-${build.id}`,
      productId: build.id,
      title: build.title,
      department: 'pc_builds',
      departmentName: 'PC Builds',
      price: rupeeStr,
      numericPrice: numPrice || 49999,
      imageUrl: build.imageUrl,
      quantity: 1,
      cashOnDeliveryEligible: false,
      details: build.specs ? `Specs: ${build.specs.slice(0, 70)}...` : undefined
    };
    addToCart(cartItem);
  };

  const handleAddAccessoryToCart = (item: Accessory) => {
    const rupeeStr = formatRupeePrice(item.price, 1499);
    const numPrice = parseNumericPrice(rupeeStr);
    const cartItem: CartItem = {
      id: `acc-${item.id}`,
      productId: item.id,
      title: item.title,
      department: 'accessories',
      departmentName: 'Tech Accessories',
      price: rupeeStr,
      numericPrice: numPrice || 1499,
      imageUrl: item.imageUrl,
      quantity: 1,
      cashOnDeliveryEligible: false,
      details: item.brand ? `Brand: ${item.brand}` : undefined
    };
    addToCart(cartItem);
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setCart([]);
  };

  const handleButtonClick = (item: HubItem) => {
    setActiveView(item.id);
  };

  const handleBackToHub = () => {
    setActiveView('hub');
  };

  // Books Portal Handlers
  const handleOpenBooksAdmin = (book?: Book) => {
    setEditingBook(book || null);
    setActiveView('books-admin');
  };

  // PC Builds Portal Handlers
  const handleOpenPcAdmin = (build?: PcBuild) => {
    setEditingPcBuild(build || null);
    setActiveView('pc-admin');
  };

  // Accessories Portal Handlers
  const handleOpenAccessoriesAdmin = (accessory?: Accessory) => {
    setEditingAccessory(accessory || null);
    setActiveView('accessories-admin');
  };

  const handleSwitchAdminPortal = (portal: 'books-admin' | 'pc-admin' | 'accessories-admin' | 'orders-admin') => {
    setActiveView(portal);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isPublicView = activeView === 'hub' || activeView.startsWith('btn-');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-sky-200 selection:text-sky-900">
      <AnimatePresence mode="wait">
        {/* Main Hub View */}
        {activeView === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
          >
            {/* Header */}
            <header id="hub-header" className="text-center mb-10 sm:mb-14">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  Polarith Business Hub
                </h1>
                <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-md mx-auto">
                  Select a service to get started
                </p>

                {/* Admin and Orders portal shortcut */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveView('orders-admin')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                    <span>Admin & Orders Portal</span>
                  </button>
                </div>
              </motion.div>
            </header>

            {/* 3 Light Blue Buttons Grid */}
            <main id="hub-buttons-container" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {HUB_ITEMS.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className="h-full flex"
                  >
                    <HubButton item={item} onClick={handleButtonClick} />
                  </motion.div>
                ))}
              </div>
            </main>
          </motion.div>
        )}

        {/* Public Books Hub View */}
        {activeView === 'btn-books-hub' && (
          <div key="books-hub" className="flex-1 flex flex-col">
            <BooksHubView
              books={books}
              onBack={handleBackToHub}
              onOpenAdmin={handleOpenBooksAdmin}
              onAddToCart={handleAddBookToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>
        )}

        {/* Books Hub Admin Portal */}
        {activeView === 'books-admin' && (
          <div key="books-admin" className="flex-1 flex flex-col">
            <BooksAdminPortal
              books={books}
              initialEditBook={editingBook}
              onBack={() => {
                setEditingBook(null);
                setActiveView('btn-books-hub');
              }}
              onSwitchPortal={handleSwitchAdminPortal}
            />
          </div>
        )}

        {/* Public PC Builds View */}
        {activeView === 'btn-pc-builds' && (
          <div key="pc-builds" className="flex-1 flex flex-col">
            <PcBuildsHubView
              builds={pcBuilds}
              onBack={handleBackToHub}
              onOpenAdmin={handleOpenPcAdmin}
              onAddToCart={handleAddPcBuildToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>
        )}

        {/* PC Builds Admin Portal */}
        {activeView === 'pc-admin' && (
          <div key="pc-admin" className="flex-1 flex flex-col">
            <PcBuildsAdminPortal
              builds={pcBuilds}
              initialEditBuild={editingPcBuild}
              onBack={() => {
                setEditingPcBuild(null);
                setActiveView('btn-pc-builds');
              }}
              onSwitchPortal={handleSwitchAdminPortal}
            />
          </div>
        )}

        {/* Public Tech Accessories Wholesale View */}
        {activeView === 'btn-tech-wholesale' && (
          <div key="tech-wholesale" className="flex-1 flex flex-col">
            <AccessoriesHubView
              accessories={accessories}
              onBack={handleBackToHub}
              onOpenAdmin={handleOpenAccessoriesAdmin}
              onAddToCart={handleAddAccessoryToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>
        )}

        {/* Tech Accessories Admin Portal */}
        {activeView === 'accessories-admin' && (
          <div key="accessories-admin" className="flex-1 flex flex-col">
            <AccessoriesAdminPortal
              accessories={accessories}
              initialEditAccessory={editingAccessory}
              onBack={() => {
                setEditingAccessory(null);
                setActiveView('btn-tech-wholesale');
              }}
              onSwitchPortal={handleSwitchAdminPortal}
            />
          </div>
        )}

        {/* Unified Customer Orders Admin Portal */}
        {activeView === 'orders-admin' && (
          <div key="orders-admin" className="flex-1 flex flex-col">
            <OrdersAdminView
              onBack={handleBackToHub}
              onSwitchPortal={handleSwitchAdminPortal}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button in public views */}
      {isPublicView && (
        <CartButton
          items={cart}
          onClick={() => setIsCartOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
