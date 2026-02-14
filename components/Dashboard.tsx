
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Product, OwnerProfile, BusinessType, UserRole, PaymentMethod } from '../types';
import { getBusinessInsights } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  products: Product[];
  businessName: string;
  ownerProfile: OwnerProfile;
  businessType: BusinessType;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, products, businessName, ownerProfile, businessType, userRole }) => {
  const [insights, setInsights] = useState<string>('Checking your records...');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const anomalies = useMemo(() => transactions.filter(t => t.isAnomaly), [transactions]);

  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
    const totalCOGS = transactions.reduce((acc, t) => acc + (t.costOfGoods || 0), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const inventoryValuation = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);

    return {
      totalRevenue,
      grossProfit,
      margin,
      inventoryValuation,
      txCount: transactions.length
    };
  }, [transactions, products]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTxs = transactions.filter(t => new Date(t.timestamp).toISOString().split('T')[0] === date);
      const rev = dayTxs.reduce((acc, t) => acc + t.total, 0);
      const cost = dayTxs.reduce((acc, t) => acc + (t.costOfGoods || 0), 0);
      return {
        name: date.split('-').slice(1).join('/'),
        Revenue: rev,
        Profit: rev - cost
      };
    });
  }, [transactions]);

  const downloadAuditPack = () => {
    const timestamp = new Date().toLocaleString();
    let csvContent = `BUSINESS REPORT - ${businessName}\n`;
    csvContent += `Created: ${timestamp}\n`;
    csvContent += `Job Role: ${userRole}\n\n`;

    csvContent += `--- MONEY SUMMARY ---\n`;
    csvContent += `Total Sales,KES ${stats.totalRevenue.toFixed(2)}\n`;
    csvContent += `Cost of Goods,KES ${(stats.totalRevenue - stats.grossProfit).toFixed(2)}\n`;
    csvContent += `Gross Profit,KES ${stats.grossProfit.toFixed(2)}\n`;
    csvContent += `Profit Margin,${stats.margin.toFixed(2)}%\n`;
    csvContent += `Tax (VAT 16%),KES ${(stats.totalRevenue * 0.16).toFixed(2)}\n`;
    csvContent += `Stock Value,KES ${stats.inventoryValuation.toFixed(2)}\n\n`;

    csvContent += `--- DAILY SALES (LAST 7 DAYS) ---\n`;
    csvContent += `Date,Sales,Profit\n`;
    chartData.forEach(day => {
      csvContent += `${day.name},${day.Revenue.toFixed(2)},${day.Profit.toFixed(2)}\n`;
    });
    csvContent += `\n`;

    csvContent += `--- FLAGGED PROBLEMS ---\n`;
    if (anomalies.length === 0) {
      csvContent += `No problems found.\n`;
    } else {
      csvContent += `Sale ID,Time,Reason,Amount\n`;
      anomalies.forEach(a => {
        csvContent += `${a.id},${new Date(a.timestamp).toLocaleString()},"${a.anomalyReason}",KES ${a.total.toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `veira_business_report_${Date.now()}.csv`);
    link.click();
  };

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const text = await getBusinessInsights(transactions, products, ownerProfile, businessType, userRole);
      setInsights(text || "Records look good! No issues found.");
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [transactions.length, ownerProfile, businessType, userRole]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 md:pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full">
          <h2 className="text-2xl md:text-4xl font-display text-[#2C0D36] tracking-tight truncate">{businessName}</h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3 md:mt-4">
             <div className="h-0.5 md:h-1 w-8 md:w-12 bg-[#8A3FA0] rounded-full"></div>
             <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-[#783D77] opacity-60">
               Shop Dashboard • <span className="text-[#2D9B9B]">{userRole}</span>
             </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {anomalies.length > 0 && (
            <div className="bg-red-50 text-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{anomalies.length} Flagged</span>
            </div>
          )}
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-emerald-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Safe</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Sales" value={`KES ${stats.totalRevenue.toLocaleString()}`} subtitle={`${stats.txCount} Sales`} />
        <StatCard title="Total Profit" value={`KES ${stats.grossProfit.toLocaleString()}`} color="text-emerald-600" subtitle={`Margin: ${stats.margin.toFixed(1)}%`} />
        <StatCard title="Stock Value" value={`KES ${stats.inventoryValuation.toLocaleString()}`} subtitle="Current Value" />
        <StatCard title="Estimated Tax" value={`KES ${(stats.totalRevenue * 0.16).toLocaleString()}`} subtitle="16% VAT" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 md:mb-8">Sales History</h3>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#531753" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#531753" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#531753" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Profit" stroke="#2D9B9B" fillOpacity={0} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5 md:mb-6">How People Paid</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
               <div className="p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl space-y-2 md:space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-bold text-slate-600">M-PESA Sales</span>
                    <span className="text-xs md:text-sm font-black text-[#2C0D36]">KES {transactions.filter(t => t.paymentMethod === PaymentMethod.MPESA).reduce((a,b)=>a+b.total,0).toLocaleString()}</span>
                 </div>
                 <div className="h-1 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]"></div>
                 </div>
               </div>
               <div className="p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl space-y-2 md:space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-bold text-slate-600">Cash Sales</span>
                    <span className="text-xs md:text-sm font-black text-[#2C0D36]">KES {transactions.filter(t => t.paymentMethod === PaymentMethod.CASH).reduce((a,b)=>a+b.total,0).toLocaleString()}</span>
                 </div>
                 <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[60%]"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="bg-[#2C0D36] text-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] orb-idle"></div>
              <h3 className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">AI Assistant</h3>
            </div>
            {loadingInsights ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-2 bg-white/10 rounded w-full"></div>
                <div className="h-2 bg-white/10 rounded w-4/5"></div>
              </div>
            ) : (
              <p className="text-sm md:text-lg leading-relaxed font-light text-slate-200">{insights}</p>
            )}
            <button 
              onClick={downloadAuditPack}
              className="mt-6 md:mt-8 w-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-400/20 px-4 py-2.5 rounded-xl bg-emerald-400/5 hover:bg-emerald-400/10 transition-all active:scale-[0.98]"
            >
              Get Business Report
            </button>
          </div>

          <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
             <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Stock Value</h3>
             <div className="space-y-3 md:space-y-4">
               {products.slice(0, 3).map(p => (
                 <div key={p.id} className="flex justify-between items-center text-[10px] md:text-xs">
                    <span className="text-slate-600 font-medium truncate max-w-[100px] md:max-w-[120px]">{p.name}</span>
                    <span className="text-slate-400 font-bold">{p.stock} units</span>
                 </div>
               ))}
               <div className="pt-3 md:pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] md:text-xs font-black text-[#2C0D36]">
                  <span>Total Value</span>
                  <span>KES {stats.inventoryValuation.toLocaleString()}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; color?: string; subtitle?: string }> = ({ title, value, color, subtitle }) => (
  <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
    <h4 className={`text-xl md:text-2xl font-black truncate ${color || 'text-[#2C0D36]'}`}>{value}</h4>
    {subtitle && <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-200"></span> {subtitle}</p>}
  </div>
);

export default Dashboard;
