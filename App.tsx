
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_PRODUCTS, Icons, generateMockTransactions } from './constants';
import { Product, Transaction, OwnerProfile, BusinessType, UserRole } from './types';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Compliance from './components/Compliance';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import Login from './components/Login';

interface SidebarItem {
  id: 'dashboard' | 'pos' | 'inventory' | 'reports' | 'settings' | 'alerts' | 'compliance';
  label: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory' | 'reports' | 'settings' | 'alerts' | 'compliance'>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [businessName, setBusinessName] = useState('Mama Mboga Supermart');
  const [kraPin, setKraPin] = useState('P051XXXXXXX');
  const [vatRate, setVatRate] = useState(16);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(OwnerProfile.GROWTH);
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.RETAIL);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.OWNER);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getSidebarItems = useMemo((): SidebarItem[] => {
    switch (userRole) {
      case UserRole.OWNER:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <Icons.Dashboard /> },
          { id: 'pos', label: 'Sell', icon: <Icons.POS /> },
          { id: 'compliance', label: 'Tax Compliance', icon: <Icons.Compliance /> },
          { id: 'inventory', label: 'Stock Management', icon: <Icons.Inventory /> },
          { id: 'reports', label: 'Sales Records', icon: <Icons.Profit /> },
          { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
        ];
      case UserRole.ACCOUNTANT:
      case UserRole.FINANCE_MANAGER:
        return [
          { id: 'dashboard', label: 'Money Overview', icon: <Icons.Dashboard /> },
          { id: 'compliance', label: 'Tax Records', icon: <Icons.Compliance /> },
          { id: 'reports', label: 'Sales History', icon: <Icons.Reports /> },
          { id: 'inventory', label: 'Stock Value', icon: <Icons.Inventory /> },
          { id: 'settings', label: 'Tax Settings', icon: <Icons.Settings /> },
        ];
      case UserRole.AUDITOR:
        return [
          { id: 'dashboard', label: 'Numbers Overview', icon: <Icons.Dashboard /> },
          { id: 'compliance', label: 'Tax Audit', icon: <Icons.Compliance /> },
          { id: 'reports', label: 'Check Records', icon: <Icons.Reports /> },
          { id: 'inventory', label: 'Check Stock', icon: <Icons.Alerts /> },
        ];
      case UserRole.STORE_MANAGER:
        return [
          { id: 'dashboard', label: 'Shop Overview', icon: <Icons.Dashboard /> },
          { id: 'pos', label: 'Start Selling', icon: <Icons.POS /> },
          { id: 'inventory', label: 'Manage Stock', icon: <Icons.Inventory /> },
          { id: 'reports', label: 'Staff Work', icon: <Icons.Staff /> },
        ];
      case UserRole.CASHIER:
        return [
          { id: 'pos', label: 'Sales Counter', icon: <Icons.POS /> },
          { id: 'dashboard', label: 'My Sales', icon: <Icons.Dashboard /> },
        ];
      case UserRole.STOCK_MANAGER:
        return [
          { id: 'inventory', label: 'Stock Records', icon: <Icons.Inventory /> },
          { id: 'dashboard', label: 'Stock Alerts', icon: <Icons.Alerts /> },
        ];
      default:
        return [{ id: 'dashboard', label: 'Overview', icon: <Icons.Dashboard /> }];
    }
  }, [userRole]);

  useEffect(() => {
    const savedData = localStorage.getItem('veira-data');
    const authStatus = localStorage.getItem('veira-auth');
    if (authStatus === 'true') setIsLoggedIn(true);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.transactions && parsed.transactions.length > 0) setTransactions(parsed.transactions);
        else setTransactions(generateMockTransactions(INITIAL_PRODUCTS));
        
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.kraPin) setKraPin(parsed.kraPin);
        if (parsed.ownerProfile) setOwnerProfile(parsed.ownerProfile);
        if (parsed.businessType) setBusinessType(parsed.businessType);
        if (parsed.userRole) setUserRole(parsed.userRole);
      } catch (e) { 
        setTransactions(generateMockTransactions(INITIAL_PRODUCTS));
      }
    } else {
      setTransactions(generateMockTransactions(INITIAL_PRODUCTS));
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('veira-data', JSON.stringify({
        products, transactions, businessName, kraPin, ownerProfile, businessType, userRole
      }));
    }
  }, [products, transactions, businessName, kraPin, ownerProfile, businessType, userRole, isLoggedIn]);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    localStorage.setItem('veira-auth', 'true');
    if (role === UserRole.ACCOUNTANT || role === UserRole.AUDITOR) setActiveTab('reports');
    else if (role === UserRole.STOCK_MANAGER) setActiveTab('inventory');
    else if (role === UserRole.CASHIER) setActiveTab('pos');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('veira-auth');
    setActiveTab('dashboard');
  };

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    setProducts(prev => prev.map(p => {
      const soldItem = t.items.find(item => item.id === p.id);
      if (soldItem) return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      return p;
    }));
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} products={products} businessName={businessName} ownerProfile={ownerProfile} businessType={businessType} userRole={userRole} />;
      case 'pos': return <POS products={products} onCompleteTransaction={addTransaction} vatRate={vatRate} />;
      case 'inventory': return <Inventory products={products} userRole={userRole} onUpdate={(p) => setProducts(products.map(x => x.id === p.id ? p : x))} onDelete={(id) => setProducts(products.filter(x => x.id !== id))} onAdd={(p) => setProducts([...products, p])} />;
      case 'reports': return <Reports transactions={transactions} userRole={userRole} products={products} />;
      case 'compliance': return <Compliance transactions={transactions} products={products} kraPin={kraPin} />;
      case 'settings': return <Settings businessName={businessName} setBusinessName={setBusinessName} kraPin={kraPin} setKraPin={setKraPin} vatRate={vatRate} setVatRate={setVatRate} ownerProfile={ownerProfile} setOwnerProfile={setOwnerProfile} businessType={businessType} setBusinessType={setBusinessType} userRole={userRole} setUserRole={setUserRole} />;
      default: return <Dashboard transactions={transactions} products={products} businessName={businessName} ownerProfile={ownerProfile} businessType={businessType} userRole={userRole} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-black relative">
      <aside className={`hidden md:flex flex-col transition-all duration-300 ease-in-out bg-black text-slate-200 h-full border-r border-white/5 shrink-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-8 flex items-center justify-between border-b border-white/5 shrink-0 ${isCollapsed ? 'px-6' : ''}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] orb-idle shadow-sm shadow-[#8A3FA0]/20"></div>
            {!isCollapsed && <span className="font-bold text-xl tracking-tight text-white animate-in fade-in duration-300">Veira</span>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar overscroll-contain">
          {getSidebarItems.map((item) => (
            <NavItem 
              key={item.id}
              collapsed={isCollapsed} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)} 
              icon={item.icon} 
              label={item.label} 
            />
          ))}
          
          <div className={`pt-6 mt-6 border-t border-white/10 flex flex-col ${isCollapsed ? 'items-center gap-2' : 'space-y-1'}`}>
            <button 
              onClick={() => setIsAssistantOpen(true)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-emerald-400 group w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? "AI Assistant" : ""}
            >
              <Icons.Assistant />
              {!isCollapsed && <span className="font-medium text-sm animate-in fade-in duration-300">AI Assistant</span>}
            </button>
            <button 
              onClick={handleLogout} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-500/10 text-red-400/80 w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              {!isCollapsed && <span className="font-medium text-sm animate-in fade-in duration-300">Sign Out</span>}
            </button>
          </div>
        </nav>
        
        <div className={`shrink-0 bg-white/5 m-4 rounded-2xl border border-white/5 transition-all duration-300 ${isCollapsed ? 'p-2 mx-2 text-center' : 'p-6'}`}>
          {!isCollapsed ? (
            <div className="animate-in fade-in duration-300">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Logged In As</p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-emerald-400/90 font-black uppercase truncate">{userRole}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={userRole}>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
          )}
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-black border-b border-white/10 z-40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] orb-idle"></div>
          <span className="font-bold text-lg tracking-tight text-white">Veira</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="p-2 bg-red-950/30 text-red-500 rounded-xl border border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50 relative wave-bg pb-24 md:pb-0">
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto h-full">{renderContent()}</div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-2 py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] safe-area-bottom">
        {getSidebarItems.slice(0, 4).map((item) => (
          <MobileNavItem 
            key={item.id}
            active={activeTab === item.id} 
            onClick={() => setActiveTab(item.id)} 
            icon={item.icon} 
            label={item.label.split(' ')[0]} 
          />
        ))}
        <button 
          onClick={() => setIsAssistantOpen(true)} 
          className="relative -top-8 w-14 h-14 bg-[#2D9B9B] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-black transform active:scale-90 transition-all z-[60]"
        >
          <Icons.Assistant />
        </button>
      </nav>

      {/* FIX: Changed onClose handler to correctly use the setIsAssistantOpen setter */}
      <Assistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} transactions={transactions} products={products} ownerProfile={ownerProfile} businessType={businessType} userRole={userRole} />
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; collapsed?: boolean }> = ({ active, onClick, icon, label, collapsed }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full group ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center px-0' : ''}`}
    title={collapsed ? label : ""}
  >
    <div className={`transition-all duration-300 ${active ? 'scale-110 text-[#2D9B9B]' : 'group-hover:scale-105'}`}>{icon}</div>
    {!collapsed && <span className={`font-bold text-sm tracking-tight transition-all duration-300 delay-100 ${active ? 'translate-x-0.5' : ''}`}>{label}</span>}
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${active ? 'text-white opacity-100 scale-110' : 'text-slate-400 opacity-60'}`}>
    <div className="scale-75">{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
