
import React, { useMemo } from 'react';
import { Transaction, Product, Category } from '../types';
// FIX: Added missing import for Icons
import { Icons } from '../constants';

interface ComplianceProps {
  transactions: Transaction[];
  products: Product[];
  kraPin: string;
}

const Compliance: React.FC<ComplianceProps> = ({ transactions, products, kraPin }) => {
  const regulatedItems = useMemo(() => {
    return products.filter(p => p.category === Category.HOUSEHOLD || p.name.includes('Gas'));
  }, [products]);

  const stats = useMemo(() => {
    const totalVAT = transactions.reduce((acc, t) => acc + t.vat, 0);
    const syncedCount = transactions.length; 
    return { totalVAT, syncedCount };
  }, [transactions]);

  const generateETimsPack = () => {
    const content = `TAX REPORT (E-TIMS)\nKRA PIN: ${kraPin}\nCreated: ${new Date().toLocaleString()}\n\n` +
      `Summary:\nTotal Sales Sent: ${stats.syncedCount}\nTotal Tax Collected (VAT): KES ${stats.totalVAT.toFixed(2)}\n\n` +
      `Sales History:\n` +
      transactions.map(t => `${t.id} | ${new Date(t.timestamp).toISOString()} | Tax: KES ${t.vat.toFixed(2)} | Status: SENT`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_report_${kraPin}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 md:pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display text-[#2C0D36]">Tax Records</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manage your KRA and tax files.</p>
        </div>
        <button 
          onClick={generateETimsPack}
          className="w-full md:w-auto bg-[#2C0D36] text-white px-8 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all"
        >
          Download Tax Report
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KRA Connection</p>
            <h4 className="text-sm font-bold text-emerald-600 uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Connected
            </h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
             <Icons.Reports />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (VAT) Collected</p>
            <h4 className="text-sm font-bold text-[#2C0D36]">KES {stats.totalVAT.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M21 9H3"/><path d="M21 15H3"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your KRA PIN</p>
            <h4 className="text-sm font-mono font-bold text-[#2C0D36] uppercase">{kraPin}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <h3 className="text-xs font-black text-[#2C0D36] uppercase tracking-widest">Controlled Items</h3>
             <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white rounded-lg border border-slate-100">KRA-MAPPED</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[9px] font-black text-slate-400 uppercase bg-slate-50/30">
                <tr>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Stock Level</th>
                  <th className="px-6 py-4">Audit Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {regulatedItems.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-bold text-[#2C0D36]">{p.name}</td>
                    <td className="px-6 py-4 text-slate-500">{p.stock} Units</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400 uppercase">KRA-{p.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <h3 className="text-xs font-black text-[#2C0D36] uppercase tracking-widest">Recent Verified Sales</h3>
             <span className="text-[10px] font-bold text-emerald-500 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">SENT</span>
          </div>
          <div className="overflow-y-auto max-h-[300px]">
            <div className="divide-y divide-slate-50">
              {transactions.slice(0, 10).map(t => (
                <div key={t.id} className="p-4 flex justify-between items-center">
                   <div className="space-y-1">
                      <p className="font-mono text-[10px] font-bold text-[#2C0D36]">{t.id}</p>
                      <p className="text-[9px] text-slate-400">{new Date(t.timestamp).toLocaleTimeString()}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-600">SENT</p>
                      <p className="text-[8px] text-slate-300 font-mono">CODE: {t.id.split('-').pop()}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
