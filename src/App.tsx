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
import { HUB_ITEMS } from './data/hubItems';
import { subscribeBooks } from './services/booksService';
import { subscribePcBuilds } from './services/pcBuildsService';
import { subscribeAccessories } from './services/accessoriesService';
import type { HubItem } from './types';
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

  const handleSwitchAdminPortal = (portal: 'books-admin' | 'pc-admin' | 'accessories-admin') => {
    setActiveView(portal);
  };

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
            {/* Header - Clean typography, no logo */}
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
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}

