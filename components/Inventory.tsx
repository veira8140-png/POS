
import React, { useState } from 'react';
import { Product, Category, UserRole } from '../types';
import { Icons } from '../constants';

interface InventoryProps {
  products: Product[];
  userRole: UserRole;
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
  onAdd: (p: Product) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, userRole, onUpdate, onDelete, onAdd }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canSeeCost = [UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.AUDITOR].includes(userRole);
  const canEdit = [UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.STOCK_MANAGER].includes(userRole);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const product: Product = {
      id: editingId || Date.now().toString(),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      cost: Number(formData.get('cost') || products.find(p=>p.id===editingId)?.cost || 0),
      stock: Number(formData.get('stock')),
      category: formData.get('category') as Category,
      imageUrl: (formData.get('imageUrl') as string) || `https://picsum.photos/seed/${formData.get('name')}/200`,
    };
    if (editingId) { onUpdate(product); setEditingId(null); }
    else { onAdd(product); setIsAdding(false); }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display text-[#2C0D36]">Stock Ledger</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manage items and inventory valuation.</p>
        </div>
        {canEdit && (
          <button onClick={() => setIsAdding(true)} className="w-full sm:w-auto bg-[#2C0D36] text-white px-8 py-3 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">+ New Item</button>
        )}
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            {/* SEARCH BAR UI IMPROVEMENT: LIQUID GLASS */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2C0D36]">
              <Icons.Search />
            </div>
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="pl-12 pr-4 py-4 w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2C0D36]/10 text-[#2C0D36] font-black text-sm shadow-inner placeholder:text-slate-400 placeholder:font-medium transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredProducts.map(p => (
            <div key={p.id} className="p-4 flex gap-4 items-start">
              <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-100" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-[#2C0D36] text-sm truncate">{p.name}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {p.stock} Units
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-2">{p.category}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-[#2C0D36]">KES {p.price}</span>
                    {canSeeCost && <span className="text-[10px] text-slate-400 ml-2">Cost: {p.cost}</span>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(p.id)} className="p-2 bg-slate-50 rounded-lg text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                      <button onClick={() => onDelete(p.id)} className="p-2 bg-red-50 rounded-lg text-red-400"><Icons.Trash /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Item</th>
                <th className="px-8 py-5">Category</th>
                {canSeeCost && <th className="px-8 py-5">Cost Basis</th>}
                <th className="px-8 py-5">Retail Price</th>
                <th className="px-8 py-5">In Stock</th>
                <th className="px-8 py-5">Status</th>
                {canEdit && <th className="px-8 py-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100" />
                      <span className="font-bold text-[#2C0D36] text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-medium uppercase">{p.category}</td>
                  {canSeeCost && <td className="px-8 py-5 text-slate-500 text-sm">KES {p.cost}</td>}
                  <td className="px-8 py-5 font-bold text-[#2C0D36] text-sm">KES {p.price}</td>
                  <td className="px-8 py-5 font-medium text-slate-800 text-sm">{p.stock}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'Good'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditingId(p.id)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-[#2C0D36] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                        <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-[#2C0D36]/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white rounded-t-[32px] md:rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-display text-xl text-[#2C0D36]">{editingId ? 'Update Stock Item' : 'Create New Item'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-300 p-2 hover:text-[#2C0D36]">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Name</label>
                  <input name="name" defaultValue={editingId ? products.find(p => p.id === editingId)?.name : ''} required className="w-full px-5 py-3 border border-slate-100 rounded-2xl focus:border-[#783D77]/20 text-sm" />
                </div>
                {canSeeCost && (
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Cost (KES)</label>
                    <input name="cost" type="number" defaultValue={editingId ? products.find(p => p.id === editingId)?.cost : ''} required className="w-full px-5 py-3 border border-slate-100 rounded-2xl focus:border-[#783D77]/20 text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Retail Price (KES)</label>
                  <input name="price" type="number" defaultValue={editingId ? products.find(p => p.id === editingId)?.price : ''} required className="w-full px-5 py-3 border border-slate-100 rounded-2xl focus:border-[#783D77]/20 text-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Initial Stock</label>
                  <input name="stock" type="number" defaultValue={editingId ? products.find(p => p.id === editingId)?.stock : ''} required className="w-full px-5 py-3 border border-slate-100 rounded-2xl focus:border-[#783D77]/20 text-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
                  <select name="category" defaultValue={editingId ? products.find(p => p.id === editingId)?.category : Category.OTHER} className="w-full px-5 py-3 border border-slate-100 rounded-2xl bg-white text-sm">
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-[#2D9B9B] text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[#2D9B9B]/20 transition-all">Submit Entry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
