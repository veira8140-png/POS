
import React from 'react';
import { OwnerProfile, BusinessType, UserRole } from '../types';

interface SettingsProps {
  businessName: string;
  setBusinessName: (val: string) => void;
  kraPin: string;
  setKraPin: (val: string) => void;
  vatRate: number;
  setVatRate: (val: number) => void;
  ownerProfile: OwnerProfile;
  setOwnerProfile: (val: OwnerProfile) => void;
  businessType: BusinessType;
  setBusinessType: (val: BusinessType) => void;
  userRole: UserRole;
  setUserRole: (val: UserRole) => void;
}

const PROFILE_DATA = [
  { id: OwnerProfile.SURVIVAL, icon: '💰', desc: 'Focus on daily cash.' },
  { id: OwnerProfile.BURNED, icon: '🛡️', desc: 'Watch for missing items.' },
  { id: OwnerProfile.GROWTH, icon: '📈', desc: 'Focus on growth.' },
  { id: OwnerProfile.COMPLIANCE, icon: '📜', desc: 'Correct records.' },
  { id: OwnerProfile.HANDS_OFF, icon: '🏝️', desc: 'Quick check-ins.' }
];

const BUSINESS_TYPES = [
  { id: BusinessType.RETAIL, icon: '🏪', desc: 'General Shop.' },
  { id: BusinessType.RESTAURANT, icon: '🍽️', desc: 'Food Place.' },
  { id: BusinessType.ELECTRONICS, icon: '💻', desc: 'Electronics.' },
  { id: BusinessType.PHARMACY, icon: '💊', desc: 'Chemist.' },
  { id: BusinessType.LIQUOR, icon: '🍾', desc: 'Drinks Shop.' },
  { id: BusinessType.CAR_YARD, icon: '🚗', desc: 'Car Yard.' }
];

const USER_ROLES = [
  { id: UserRole.OWNER, icon: '👔', desc: 'Business Owner.' },
  { id: UserRole.ACCOUNTANT, icon: '📂', desc: 'Money person.' },
  { id: UserRole.AUDITOR, icon: '🔍', desc: 'Record checker.' },
  { id: UserRole.FINANCE_MANAGER, icon: '📊', desc: 'Finance manager.' },
  { id: UserRole.STORE_MANAGER, icon: '🏢', name: 'MANAGER', desc: 'Shop manager.' },
  { id: UserRole.CASHIER, icon: '💵', desc: 'Sales person.' },
  { id: UserRole.STOCK_MANAGER, icon: '📦', desc: 'Store keeper.' }
];

const Settings: React.FC<SettingsProps> = ({ 
  businessName, setBusinessName, 
  kraPin, setKraPin, 
  vatRate, setVatRate, 
  ownerProfile, setOwnerProfile,
  businessType, setBusinessType,
  userRole, setUserRole
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div>
        <h2 className="text-3xl font-display text-[#2C0D36]">Setup</h2>
        <p className="text-sm text-slate-500 mt-2 font-light">Change how Veira works for you.</p>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
        
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Who is using this?</h3>
          <p className="text-xs text-slate-500 font-light -mt-2">Tell us your job so Veira can help you better.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {USER_ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setUserRole(role.id)}
                className={`p-4 rounded-3xl border-2 text-left transition-all ${
                  userRole === role.id 
                    ? 'border-[#2D9B9B] bg-[#2D9B9B]/5' 
                    : 'border-slate-50 hover:border-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">{role.icon}</span>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider">{(role as any).name || role.id}</h4>
                </div>
                <p className="text-[10px] opacity-60 leading-tight">{role.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type of Business</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {BUSINESS_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setBusinessType(type.id)}
                className={`p-4 rounded-3xl border-2 text-left transition-all ${
                  businessType === type.id 
                    ? 'border-[#8A3FA0] bg-[#8A3FA0]/5' 
                    : 'border-slate-50 hover:border-slate-100 text-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <h4 className="font-bold text-[11px] uppercase tracking-wider mb-1">{type.id}</h4>
                <p className="text-[10px] opacity-60 leading-tight">{type.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Management Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROFILE_DATA.map(profile => (
              <button
                key={profile.id}
                onClick={() => setOwnerProfile(profile.id)}
                className={`p-4 rounded-3xl border-2 text-left transition-all ${
                  ownerProfile === profile.id 
                    ? 'border-[#2C0D36] bg-[#2C0D36] text-white' 
                    : 'border-slate-50 bg-slate-50/50 hover:border-slate-100 text-slate-600'
                }`}
              >
                <h4 className="font-bold text-[11px] uppercase tracking-wider mb-1">{profile.id}</h4>
                <p className="text-[10px] opacity-70 leading-tight">{profile.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shop Name</label>
              <input 
                type="text" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-6 py-4 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#783D77] transition-all font-medium text-sm"
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">KRA PIN (Receipts)</label>
              <input 
                type="text" 
                value={kraPin} 
                onChange={(e) => setKraPin(e.target.value)}
                className="w-full px-6 py-4 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#783D77] transition-all font-mono text-sm"
              />
           </div>
        </section>

        <div className="pt-10 flex items-center justify-between">
          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
             Veira v2.1
          </div>
          <button 
            onClick={() => alert('Saved.')}
            className="px-10 py-4 bg-[#2D9B9B] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-[#2D9B9B]/30 hover:opacity-90 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
