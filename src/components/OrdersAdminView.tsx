import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  Trash2, 
  Search, 
  Truck, 
  CreditCard, 
  Package, 
  Copy, 
  Check, 
  MessageSquare, 
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowLeft,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  Database
} from 'lucide-react';
import type { CustomerOrder } from '../types';
import { subscribeOrders, updateOrderStatus, deleteCustomerOrder } from '../services/ordersService';
import { formatIndianCurrency } from '../utils/price';
import { 
  isUserAdminAuthenticated, 
  setAdminAuthenticated, 
  verifyAdminPassword 
} from '../utils/adminAuth';

interface OrdersAdminViewProps {
  onBack?: () => void;
  onSwitchPortal?: (portal: 'books-admin' | 'pc-admin' | 'accessories-admin' | 'orders-admin') => void;
}

export function OrdersAdminView({ onBack, onSwitchPortal }: OrdersAdminViewProps) {
  // Password Protection
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('Incorrect password. Please enter the master admin passcode.');
    }
  };

  const handleLockPortal = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleStatusChange = async (orderId: string, newStatus: CustomerOrder['status']) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (window.confirm(`Are you sure you want to remove order ${orderNumber}?`)) {
      try {
        await deleteCustomerOrder(orderId);
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }
  };

  const handleCopyAddress = (order: CustomerOrder) => {
    const text = `${order.customerName}\nPhone: ${order.phoneNumber}\nAddress: ${order.address}\nPIN Code: ${order.pinCode}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id || order.orderNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      order.customerName.toLowerCase().includes(query) ||
      order.phoneNumber.includes(query) ||
      order.pinCode.includes(query) ||
      order.orderNumber.toLowerCase().includes(query) ||
      order.address.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const newOrdersCount = orders.filter((o) => o.status === 'New').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

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
        {onBack && (
          <div className="w-full mb-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Hub</span>
            </button>
          </div>
        )}

        <div className="w-full p-8 rounded-3xl bg-[#EAF4FF] border border-[#BFDBFE] shadow-sm flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center mb-4 shadow-2xs">
            <Lock className="w-7 h-7 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1.5">
            Admin Orders Portal
          </h2>
          <p className="text-xs text-slate-600 mb-6 max-w-xs leading-relaxed">
            This customer orders portal is password-protected. Enter the administrator passcode to view orders and customer details.
          </p>

          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 text-left">
            <div>
              <label htmlFor="orders-admin-passcode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="orders-admin-passcode"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter password..."
                  required
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl bg-white border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-slate-900 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-sky-200" />
              <span>Unlock Orders Portal</span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-sky-200/60 w-full flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500 text-center">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Unified Administrator Authentication</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Same master password grants access across Books, PC Builds, Accessories, and Orders.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10"
    >
      {/* Top Header & Department Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Hub</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Department Switcher */}
          {onSwitchPortal && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => onSwitchPortal('books-admin')}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
              >
                Books
              </button>
              <button
                type="button"
                onClick={() => onSwitchPortal('pc-admin')}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
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
                className="px-2.5 py-1 rounded-lg bg-white text-sky-900 font-semibold shadow-2xs cursor-default flex items-center gap-1.5"
              >
                <span>Orders</span>
                {newOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                )}
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

      <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Orders</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{orders.length}</span>
            <span className="text-xs text-slate-400">lifetime</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-sky-800 block">New / Pending Dispatch</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-sky-900">{newOrdersCount}</span>
            <span className="text-xs text-sky-700 font-medium">requires action</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 block">Total Booked Volume</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-900">{formatIndianCurrency(totalRevenue)}</span>
            <span className="text-xs text-emerald-700 font-medium">active orders</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, PIN, order ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter.toLowerCase() === status.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mb-2 text-sky-600" />
          <p className="text-xs">Loading orders from Firestore...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {orders.length === 0 
              ? 'When visitors check out with their Name, Phone, Address, and PIN Code, their orders will appear here in real-time.'
              : 'No orders match your search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'New';
            return (
              <motion.div
                key={order.id || order.orderNumber}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all ${
                  isNew ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'
                }`}
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-900 border border-slate-200">
                      {order.orderNumber}
                    </span>

                    {isNew && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        New Order
                      </span>
                    )}

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {/* Status Dropdown & Delete */}
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => order.id && handleStatusChange(order.id, e.target.value as CustomerOrder['status'])}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                        order.status === 'New'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : order.status === 'Confirmed'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : order.status === 'Shipped'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      <option value="New">Status: New</option>
                      <option value="Confirmed">Status: Confirmed</option>
                      <option value="Shipped">Status: Shipped</option>
                      <option value="Delivered">Status: Delivered</option>
                      <option value="Cancelled">Status: Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => order.id && handleDelete(order.id, order.orderNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Order"
                      aria-label="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                  {/* Customer Information Block */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        <span>Customer Details</span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => handleCopyAddress(order)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 transition-colors cursor-pointer"
                        title="Copy full delivery contact info"
                      >
                        {copiedId === (order.id || order.orderNumber) ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Details</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 text-[11px] w-16 flex-shrink-0">Name:</span>
                        <span className="font-bold text-slate-900">{order.customerName}</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 text-[11px] w-16 flex-shrink-0">Phone:</span>
                        <span className="font-mono font-bold text-slate-900">{order.phoneNumber}</span>
                        <div className="inline-flex items-center gap-2 ml-2">
                          <a
                            href={`tel:${order.phoneNumber}`}
                            className="p-1 rounded-md bg-white hover:bg-slate-200/80 text-sky-700 border border-slate-200 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://wa.me/91${order.phoneNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 text-[11px] w-16 flex-shrink-0 pt-0.5">Address:</span>
                        <span className="text-slate-800 font-medium leading-snug">{order.address}</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 text-[11px] w-16 flex-shrink-0">PIN Code:</span>
                        <span className="font-mono font-bold text-sky-800 bg-sky-100/60 px-2 py-0.5 rounded border border-sky-200">
                          {order.pinCode}
                        </span>
                      </div>

                      {order.notes && (
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 text-slate-500">
                          <span className="text-slate-400 text-[11px] w-16 flex-shrink-0">Notes:</span>
                          <span className="italic">{order.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items & Totals */}
                  <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-sky-600" />
                          <span>Ordered Products ({order.itemCount || order.items.length})</span>
                        </h4>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          {order.paymentMode.includes('Cash on Delivery') ? (
                            <>
                              <Truck className="w-3 h-3 text-emerald-600" />
                              <span>Cash on Delivery</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3 h-3 text-sky-600" />
                              <span>Prepaid Online</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                                {item.departmentName || item.department}
                              </span>
                              <span className="truncate font-medium text-slate-900">{item.title}</span>
                              <span className="text-slate-500 flex-shrink-0">×{item.quantity}</span>
                            </div>
                            <span className="font-semibold text-slate-900 flex-shrink-0">
                              {formatIndianCurrency(item.numericPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Total Payable:</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {order.formattedTotal || formatIndianCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </motion.div>
  );
}
