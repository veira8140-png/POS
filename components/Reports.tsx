
import React, { useState } from 'react';
import { Transaction, PaymentMethod, UserRole, Product } from '../types';
import { Icons } from '../constants';

interface ReportsProps {
  transactions: Transaction[];
  userRole: UserRole;
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, userRole, products }) => {
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  
  const canSeeAllMoney = [UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.AUDITOR].includes(userRole);
  const displayTransactions = filterAnomaly 
    ? transactions.filter(t => t.isAnomaly) 
    : transactions;

  const totalVatCollected = transactions.reduce((acc, t) => acc + t.vat, 0);
  const totalGross = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalCOGS = transactions.reduce((acc, t) => acc + (t.costOfGoods || 0), 0);

  const downloadReport = (format: 'csv' | 'pdf') => {
    if (!canSeeAllMoney) return alert('Restricted: Accountants and Owners only.');
    
    if (format === 'csv') {
      const headers = ['Date', 'Sale ID', 'Revenue', 'Tax', 'Cost', 'Profit', 'Method', 'Flagged'].join(',');
      const rows = transactions.map(t => {
        const profit = t.total - (t.costOfGoods || 0) - t.vat;
        return [
          new Date(t.timestamp).toLocaleDateString(),
          t.id,
          t.total.toFixed(2),
          t.vat.toFixed(2),
          (t.costOfGoods || 0).toFixed(2),
          profit.toFixed(2),
          t.paymentMethod,
          t.isAnomaly ? 'YES' : 'NO'
        ].join(',');
      }).join('\n');
      
      const blob = new Blob([[headers, rows].join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      alert('Professional subscription needed for PDF.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display text-[#2C0D36]">Sales Records</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">A simple history of your shop's sales.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <button onClick={() => setFilterAnomaly(!filterAnomaly)} className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest border transition-all ${filterAnomaly ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
             {filterAnomaly ? 'Showing Problems' : 'Filter Problems'}
           </button>
           {canSeeAllMoney && (
            <button onClick={() => downloadReport('csv')} className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
              <Icons.Reports /> Export CSV
            </button>
          )}
        </div>
      </div>

      {canSeeAllMoney && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <ReportStat label="Tax Account (16%)" value={`KES ${totalVatCollected.toLocaleString()}`} icon="📜" />
          <ReportStat label="Total Cost" value={`KES ${totalCOGS.toLocaleString()}`} icon="📦" />
          <ReportStat label="Total Sales" value={`KES ${totalGross.toLocaleString()}`} icon="💰" color="text-emerald-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="md:hidden divide-y divide-slate-50">
           {displayTransactions.map(t => (
             <div key={t.id} className={`p-5 space-y-3 ${t.isAnomaly ? 'bg-red-50/20' : ''}`}>
                <div className="flex justify-between items-center">
                   <span className="font-mono text-[10px] font-bold text-[#2C0D36]">{t.id}</span>
                   <span className="text-[10px] text-slate-400 font-bold">{new Date(t.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Sale Amount</p>
                      <p className="text-base font-black text-[#2C0D36]">KES {t.total.toLocaleString()}</p>
                   </div>
                   <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${
                      t.paymentMethod === PaymentMethod.MPESA ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {t.paymentMethod}
                    </span>
                </div>
                {t.isAnomaly && (
                  <div className="p-3 bg-red-50 rounded-xl">
                     <p className="text-[9px] font-black text-red-600 uppercase mb-1">Issue Found</p>
                     <p className="text-[10px] text-slate-700 leading-tight">{t.anomalyReason}</p>
                  </div>
                )}
             </div>
           ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Sale ID</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Tax</th>
                <th className="px-8 py-5">Cost</th>
                <th className="px-8 py-5">Paid via</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayTransactions.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-300 font-medium font-display text-xl">No records found</td></tr>
              ) : (
                displayTransactions.map(t => (
                  <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors ${t.isAnomaly ? 'bg-red-50/30' : ''}`}>
                    <td className="px-8 py-5 font-mono text-[11px] text-[#2C0D36] font-bold">{t.id}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-700">{new Date(t.timestamp).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-bold text-[#2C0D36] text-xs">KES {t.total.toLocaleString()}</td>
                    <td className="px-8 py-5 text-slate-500 text-[11px]">KES {t.vat.toLocaleString()}</td>
                    <td className="px-8 py-5 text-slate-500 text-[11px]">KES {(t.costOfGoods || 0).toLocaleString()}</td>
                    <td className="px-8 py-5">
                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                         t.paymentMethod === PaymentMethod.MPESA ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                       }`}>
                         {t.paymentMethod}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      {t.isAnomaly ? (
                        <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-1 rounded-md">PROBLEM</span>
                      ) : (
                        <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">Ok</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportStat: React.FC<{ label: string, value: string, icon: string, color?: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xl">{icon}</span>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <h4 className={`text-xl md:text-2xl font-black ${color || 'text-slate-900'}`}>{value}</h4>
  </div>
);

export default Reports;
