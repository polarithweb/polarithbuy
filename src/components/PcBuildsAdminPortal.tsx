import { useState, useRef, useEffect } from 'react';
import type { DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Database,
  Pencil,
  X,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { PC_BUILD_CATEGORIES } from '../data/pcBuildsData';
import { createPcBuild, updatePcBuild, removePcBuild } from '../services/pcBuildsService';
import { compressImageFile } from '../utils/imageUpload';
import { formatRupeePrice } from '../utils/price';
import type { PcBuild } from '../data/pcBuildsData';
import { 
  isUserAdminAuthenticated, 
  setAdminAuthenticated, 
  verifyAdminPassword, 
  ADMIN_MASTER_PASSWORD 
} from '../utils/adminAuth';

interface PcBuildsAdminPortalProps {
  builds: PcBuild[];
  onBack: () => void;
  onSwitchPortal?: (portal: 'books-admin' | 'pc-admin' | 'accessories-admin' | 'orders-admin') => void;
  initialEditBuild?: PcBuild | null;
}

export function PcBuildsAdminPortal({ 
  builds, 
  onBack, 
  onSwitchPortal,
  initialEditBuild 
}: PcBuildsAdminPortalProps) {
  // Shared Password Protection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isUserAdminAuthenticated();
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Editing state
  const [editingBuildId, setEditingBuildId] = useState<string | null>(initialEditBuild?.id || null);

  // Form State
  const [title, setTitle] = useState(initialEditBuild?.title || '');
  const [category, setCategory] = useState<string>(initialEditBuild?.category || PC_BUILD_CATEGORIES[0]);
  const [specs, setSpecs] = useState(initialEditBuild?.specs || '');
  const [price, setPrice] = useState(initialEditBuild?.price || '');
  const [description, setDescription] = useState(initialEditBuild?.description || '');
  const [imagePreview, setImagePreview] = useState<string | null>(initialEditBuild?.imageUrl || null);

  // Status & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEditBuild && isAuthenticated) {
      startEditing(initialEditBuild);
    }
  }, [initialEditBuild, isAuthenticated]);

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      if (initialEditBuild) {
        startEditing(initialEditBuild);
      }
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const handleLockPortal = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

  const startEditing = (build: PcBuild) => {
    setEditingBuildId(build.id);
    setTitle(build.title);
    setCategory(build.category || PC_BUILD_CATEGORIES[0]);
    setSpecs(build.specs || '');
    setPrice(build.price || '');
    setDescription(build.description || '');
    setImagePreview(build.imageUrl || null);
    setFeedback(null);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingBuildId(null);
    setTitle('');
    setCategory(PC_BUILD_CATEGORIES[0]);
    setSpecs('');
    setPrice('');
    setDescription('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFeedback(null);
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please upload a valid image file (PNG, JPG, WebP).' });
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file);
      setImagePreview(compressedDataUrl);
      setFeedback(null);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to process the uploaded image.' });
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a PC build name.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formattedPrice = formatRupeePrice(price, 49999);

      if (editingBuildId) {
        // Edit existing build
        await updatePcBuild(editingBuildId, {
          title: title.trim(),
          category,
          specs: specs.trim(),
          price: formattedPrice,
          description: description.trim(),
          imageUrl: imagePreview || '',
        });

        setFeedback({
          type: 'success',
          message: `"${title}" has been updated in Firebase!`,
        });
        cancelEditing();
      } else {
        // Upload new build
        await createPcBuild({
          title: title.trim(),
          category,
          specs: specs.trim(),
          price: formattedPrice,
          description: description.trim(),
          imageUrl: imagePreview || '',
        });

        setFeedback({
          type: 'success',
          message: `"${title}" was successfully uploaded to Firebase Firestore!`,
        });

        // Reset form
        setTitle('');
        setSpecs('');
        setPrice('');
        setDescription('');
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Failed to save PC build:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to save to Firebase. Please verify database connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (buildId: string, buildTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${buildTitle}"?`)) {
      return;
    }

    setDeletingId(buildId);
    try {
      await removePcBuild(buildId);
      if (editingBuildId === buildId) {
        cancelEditing();
      }
      setFeedback({ type: 'success', message: `"${buildTitle}" was deleted successfully from Firebase.` });
    } catch (err) {
      console.error('Failed to delete PC build:', err);
      setFeedback({ type: 'error', message: 'Failed to remove PC build from Firebase.' });
    } finally {
      setDeletingId(null);
    }
  };

  // If NOT authenticated, show the Master Password Screen
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
        className="max-w-md mx-auto w-full px-4 py-16 flex flex-col items-center justify-center my-auto"
      >
        <div className="w-full mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to PC Builds</span>
          </button>
        </div>

        <div className="w-full p-8 rounded-3xl bg-[#EAF4FF] border border-[#BFDBFE] shadow-sm flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center mb-4 shadow-2xs">
            <Lock className="w-7 h-7 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1.5">
            Admin Access
          </h2>
          <p className="text-xs text-slate-600 mb-6 max-w-xs leading-relaxed">
            PC Builds Portal is password-protected. Enter the administrator passcode to manage inventory and configurations.
          </p>

          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 text-left">
            <div>
              <label htmlFor="pc-admin-passcode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="pc-admin-passcode"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter password..."
                  required
                  autoFocus
                  className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl bg-white border transition-all text-slate-900 focus:outline-none focus:ring-2 ${
                    authError
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-sky-200 focus:border-sky-500 focus:ring-sky-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>Unlock PC Builds Portal</span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-sky-200/60 w-full flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500 text-center">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Unified Administrator Authentication</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Same master password grants access across Books, PC Builds, and Accessories admin portals.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Authenticated Admin Portal View
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to PC Builds</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Department Switcher */}
          {onSwitchPortal && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => onSwitchPortal('books-admin')}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
              >
                Books
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-white text-sky-900 font-semibold shadow-2xs"
              >
                PC Builds
              </button>
              <button
                type="button"
                onClick={() => onSwitchPortal('accessories-admin')}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
              >
                Accessories
              </button>
              <button
                type="button"
                onClick={() => onSwitchPortal('orders-admin')}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
              >
                Orders
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Connected</span>
          </div>

          <button
            type="button"
            onClick={handleLockPortal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            title="Lock Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      <div ref={formTopRef} className="pt-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          PC Builds Admin Portal
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Add custom rigs, edit hardware specifications, or remove configurations in Firebase Firestore.
        </p>
      </div>

      {/* Notification Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="flex-1">{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:no-underline font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Direct Upload & Add/Edit PC Build Form */}
        <div className="lg:col-span-5 bg-[#EAF4FF] p-6 sm:p-7 rounded-2xl border border-[#BFDBFE] shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-sky-200/60">
            <div className="flex items-center gap-2">
              {editingBuildId ? (
                <Pencil className="w-4 h-4 text-sky-700" />
              ) : (
                <Plus className="w-4 h-4 text-sky-700" />
              )}
              <h2 className="text-base font-bold text-slate-900">
                {editingBuildId ? 'Edit PC Build' : 'Upload New PC Build'}
              </h2>
            </div>
            {editingBuildId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white text-slate-600 hover:text-slate-900 border border-sky-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Direct Image Upload Area - Portrait Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Build Image (Portrait)
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="pc-image-upload-input"
              />

              {imagePreview ? (
                <div className="relative group rounded-xl overflow-hidden border border-sky-300 bg-white p-2.5 flex items-center justify-center gap-4">
                  <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-xs">
                    <img
                      src={imagePreview}
                      alt="Portrait build preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 mb-1">
                      Portrait Ready
                    </span>
                    <p className="text-xs font-medium text-slate-700">Image uploaded</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                    isDragOver
                      ? 'border-sky-500 bg-sky-100/70'
                      : 'border-sky-300/80 bg-white hover:border-sky-400 hover:bg-sky-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Upload portrait rig image
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Drag & drop or click (PNG, JPG, WebP)
                  </p>
                </div>
              )}
            </div>

            {/* Build Name */}
            <div>
              <label htmlFor="pc-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Build Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="pc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apex Stealth Titan"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-sky-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all"
              />
            </div>

            {/* Category: Budget, Gaming, Editing and Efficiency */}
            <div>
              <label htmlFor="pc-category" className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="pc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-sky-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all cursor-pointer"
              >
                {PC_BUILD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Specs Highlights */}
            <div>
              <label htmlFor="pc-specs" className="block text-xs font-semibold text-slate-700 mb-1">
                Hardware Specs / Highlights
              </label>
              <input
                id="pc-specs"
                type="text"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                placeholder="e.g. Ryzen 7 7800X3D • RTX 4070 Super • 32GB DDR5"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-sky-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="pc-price" className="block text-xs font-semibold text-slate-700 mb-1">
                Price
              </label>
              <input
                id="pc-price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹49,999"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-sky-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="pc-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Thermal / Benchmark Details
              </label>
              <textarea
                id="pc-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thermal setup, benchmark fps, warranty details..."
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-sky-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all resize-none"
              />
            </div>

            {/* Payment Policy Notice */}
            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-xs text-slate-700 flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">100% Prepaid Policy</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  All PC Builds are custom assemblies and strictly prepaid. Cash on Delivery is disabled store-wide for PC builds.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium text-sm transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Syncing with Firebase...</span>
                ) : editingBuildId ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Upload PC Build</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Existing Live Builds List with Portrait on Right */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>PC Builds in Database ({builds.length})</span>
            </h2>
            <span className="text-xs font-medium text-slate-500">Live Firebase Data</span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[660px] pr-1">
            {builds.map((build) => {
              const isEditingThis = editingBuildId === build.id;

              return (
                <div
                  key={build.id}
                  className={`flex flex-row items-stretch justify-between gap-4 p-4 rounded-2xl bg-white border transition-all ${
                    isEditingThis
                      ? 'border-sky-500 ring-2 ring-sky-100 bg-[#F0F7FF]'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {/* Left Side: Build Info and Actions */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-100 text-sky-800">
                          {build.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {formatRupeePrice(build.price, 49999)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          <CreditCard className="w-2.5 h-2.5 text-sky-600" />
                          <span>Prepaid Only</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
                        {build.title}
                      </h3>

                      {build.specs && (
                        <p className="text-xs text-sky-700 font-medium mt-0.5 truncate">
                          {build.specs}
                        </p>
                      )}

                      {build.description && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {build.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => startEditing(build)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(build.id, build.title)}
                        disabled={deletingId === build.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Portrait Build Image */}
                  <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center self-center shadow-xs">
                    {build.imageUrl ? (
                      <img
                        src={build.imageUrl}
                        alt={build.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-slate-400 text-center">
                        <Cpu className="w-6 h-6 stroke-[1.5] text-slate-300" />
                        <span className="text-[9px] mt-1">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {builds.length === 0 && (
              <div className="text-center py-16 bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No PC builds uploaded yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Use the form on the left to upload your first custom PC build configuration with a portrait image.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
