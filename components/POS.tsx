
import React, { useState, useMemo } from 'react';
import { Product, CartItem, PaymentMethod, Transaction, Category } from '../types';
import { Icons } from '../constants';

interface POSProps {
  products: Product[];
  onCompleteTransaction: (t: Transaction) => void;
  vatRate: number;
}

const POS: React.FC<POSProps> = ({ products, onCompleteTransaction, vatRate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.MPESA);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vat = subtotal * (vatRate / 100);
  const total = subtotal + vat;
  const costOfGoods = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const transaction: Transaction = {
      id: `VRA-${Date.now()}`,
      timestamp: Date.now(),
      items: [...cart],
      total,
      vat,
      costOfGoods,
      paymentMethod,
    };

    onCompleteTransaction(transaction);
    setCart([]);
    setShowMobileCart(false);
    setIsProcessing(false);
  };

  const cartContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Icons.Cart />
          <h3 className="font-bold text-[#2C0D36] text-base md:text-lg uppercase tracking-wider">Cart</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-[#531753] text-white text-[10px] px-2.5 py-1 rounded-full font-black">{cart.length}</span>
          <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-2 text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 py-12">
             <div className="p-6 bg-slate-50 rounded-full grayscale opacity-40"><Icons.Cart /></div>
             <p className="text-[10px] uppercase font-black tracking-widest">No Items Added</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex gap-4 items-center animate-in fade-in duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                 <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-800 truncate text-xs">{item.name}</h5>
                <p className="text-[10px] text-slate-400 font-bold">KES {item.price}</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl">
                <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-slate-900 w-6 h-6 flex items-center justify-center text-lg">-</button>
                <span className="text-[11px] font-black text-[#2C0D36] w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-slate-900 w-6 h-6 flex items-center justify-center text-lg">+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 space-y-6 shrink-0">
        <div className="space-y-2">
           <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
           </div>
           <div className="flex justify-between text-[#2C0D36] font-black text-xl md:text-2xl pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="font-display">KES {total.toLocaleString()}</span>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[PaymentMethod.MPESA, PaymentMethod.CASH, PaymentMethod.CARD].map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`py-3 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest transition-all ${
                paymentMethod === method 
                  ? 'bg-[#2C0D36] text-white border-[#2C0D36] shadow-md' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>

        <button
          disabled={cart.length === 0 || isProcessing}
          onClick={handleCheckout}
          className={`w-full py-4 md:py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white transition-all shadow-xl ${
            isProcessing ? 'bg-slate-300' : 'bg-[#2D9B9B] shadow-[#2D9B9B]/20 hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Complete Sale'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 h-full relative pb-24 md:pb-0">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-6 space-y-4">
          <div className="relative">
            {/* LIQUID GLASS SEARCH BAR IN POS */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2C0D36]">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Quick search items..."
              className="block w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2C0D36]/10 text-[#2C0D36] font-black text-sm shadow-inner placeholder:text-slate-400 placeholder:font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {['All', ...Object.values(Category)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-[#2C0D36] border-[#2C0D36] text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all text-left relative group"
                disabled={p.stock <= 0}
              >
                <div className="aspect-square bg-slate-50 overflow-hidden relative">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">LOW</span>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                       <span className="bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-full">OUT</span>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 bg-white">
                  <h4 className="font-bold text-[#2C0D36] text-[11px] md:text-xs truncate">{p.name}</h4>
                  <p className="text-[#8A3FA0] font-black mt-1 text-[11px] md:text-xs">KES {p.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-[380px] xl:w-[420px] flex-col bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden sticky top-0 h-[calc(100vh-140px)]">
        {cartContent}
      </div>

      {cart.length > 0 && (
        <button 
          onClick={() => setShowMobileCart(true)}
          className="lg:hidden fixed bottom-24 left-4 right-4 h-16 bg-[#2D9B9B] text-white rounded-2xl shadow-2xl flex items-center justify-between px-6 z-40 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-center gap-3">
            <Icons.Cart />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none">Checkout</p>
              <p className="text-xs font-bold">{cart.length} items</p>
            </div>
          </div>
          <p className="text-base font-display">KES {total.toLocaleString()}</p>
        </button>
      )}

      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-[#2C0D36]/80 backdrop-blur-sm" onClick={() => setShowMobileCart(false)}></div>
          <div className="relative bg-white rounded-t-[32px] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom duration-300">
            {cartContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
