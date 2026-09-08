import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  User, 
  Hash, 
  ShieldCheck, 
  AlertCircle,
  Package,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import type { CartItem, OrderItem } from '../types';
import { formatIndianCurrency } from '../utils/price';
import { createCustomerOrder } from '../services/ordersService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}: CheckoutModalProps) {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Option
  const hasPrepaidOnlyItem = items.some((item) => item.cashOnDeliveryEligible === false);
  const [paymentMode, setPaymentMode] = useState<'Cash on Delivery' | 'Prepaid (UPI / Online)'>(
    hasPrepaidOnlyItem ? 'Prepaid (UPI / Online)' : 'Cash on Delivery'
  );

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  // Order Math
  const totalAmount = items.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);
  const formattedTotal = formatIndianCurrency(totalAmount);

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    const cleanPin = pinCode.replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.productId,
        title: item.title,
        department: item.department,
        departmentName: item.departmentName,
        price: item.price,
        numericPrice: item.numericPrice,
        quantity: item.quantity,
        imageUrl: item.imageUrl || '',
      }));

      const finalPaymentMode = hasPrepaidOnlyItem ? 'Prepaid (UPI / Online)' : paymentMode;

      const result = await createCustomerOrder({
        customerName: customerName.trim(),
        phoneNumber: cleanPhone,
        address: address.trim(),
        pinCode: cleanPin,
        items: orderItems,
        totalAmount,
        formattedTotal,
        paymentMode: finalPaymentMode,
        notes: notes.trim(),
      });

      setCompletedOrderNumber(result.orderNumber);
      onOrderSuccess();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Failed to place order. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setCompletedOrderNumber(null);
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
    setPinCode('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {completedOrderNumber ? 'Order Confirmed' : 'Checkout & Delivery'}
              </h2>
              <p className="text-xs text-slate-500">
                {completedOrderNumber ? 'Directly synced to Admin Portal' : 'Provide your delivery details below'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={completedOrderNumber ? handleFinish : onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {completedOrderNumber ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900">
              Order Placed Successfully!
            </h3>

            <p className="text-sm font-semibold text-sky-700 mt-1">
              Order Reference: <span className="font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">{completedOrderNumber}</span>
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 max-w-md mx-auto text-xs text-slate-600">
              <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-200">
                <span>Customer:</span>
                <span>{customerName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span>Phone Number:</span>
                <span className="font-mono font-medium">{phoneNumber}</span>
              </div>
              <div className="flex items-start justify-between pb-2 border-b border-slate-200">
                <span className="flex-shrink-0 mr-4">Delivery Address:</span>
                <span className="text-right font-medium text-slate-800">{address}, PIN: {pinCode}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-800">{hasPrepaidOnlyItem ? 'Prepaid Online' : paymentMode}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-sky-700">{formattedTotal}</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2 max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>
                Your order details have been securely transmitted to the Polarith Admin Portal. Our dispatch desk will contact your phone shortly.
              </span>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>Done / Back to Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Checkout Input Form */
          <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Delivery Details Section */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Shipping & Delivery Details</span>
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priyam Kesh"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Phone Number & PIN Code grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      maxLength={12}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="6-digit postal code"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complete Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Locality, City, State"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all outline-none resize-none"
                />
              </div>

              {/* Optional Instructions */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Near landmark, preferred delivery time, etc."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                <span>Payment Preference</span>
              </h3>

              {hasPrepaidOnlyItem ? (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>100% Prepaid Order Required</span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-700">
                    Your cart contains items (such as custom PC builds or prepaid publications) that require 100% upfront payment. Cash on Delivery is unavailable for this order.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMode === 'Cash on Delivery'
                        ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="Cash on Delivery"
                      checked={paymentMode === 'Cash on Delivery'}
                      onChange={() => setPaymentMode('Cash on Delivery')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cash on Delivery</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pay upon package arrival</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMode === 'Prepaid (UPI / Online)'
                        ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="Prepaid (UPI / Online)"
                      checked={paymentMode === 'Prepaid (UPI / Online)'}
                      onChange={() => setPaymentMode('Prepaid (UPI / Online)')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                        <span>Prepaid Online</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">UPI, QR, or Net Banking</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Order Items Preview */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Items in Order ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-slate-700">Total: {formattedTotal}</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <span className="truncate max-w-[280px] text-slate-800">
                      {item.title} <span className="text-slate-400">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatIndianCurrency(item.numericPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Payable Amount</span>
                <span className="text-lg font-extrabold text-slate-900">{formattedTotal}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
