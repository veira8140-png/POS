
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.OWNER);
  const [showPassword, setShowPassword] = useState(false);

  const getDisplayRole = (role: UserRole) => {
    if (role === UserRole.STORE_MANAGER) return "MANAGER";
    return role.split(' ')[0];
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans text-slate-900 overflow-x-hidden">
      <div className="hidden lg:flex lg:w-[45%] relative flex-col overflow-hidden bg-[#1A111E]">
        <div className="absolute inset-0">
           <img 
            src="https://images.pexels.com/photos/5054539/pexels-photo-5054539.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Veira Dashboard" 
            className="w-full h-full object-cover opacity-60 grayscale-[40%]"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#1A111E] via-transparent to-[#1A111E]/40"></div>
        </div>
        <div className="relative z-10 flex flex-col h-full p-16">
          <div className="mt-auto">
            <h2 className="text-white text-7xl font-semibold leading-[0.9] tracking-tight mb-4 drop-shadow-2xl font-display">
              Certainty <br />In Every Sale
            </h2>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col p-6 sm:p-12 lg:p-20 items-center justify-center relative bg-white">
        <div className="lg:hidden w-full flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] orb-idle"></div>
            <span className="font-bold text-xl tracking-tight text-[#2C0D36]">Veira</span>
          </div>
        </div>

        <div className="hidden lg:flex absolute top-8 left-8 right-8 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8A3FA0] to-[#9B4BB6] orb-idle"></div>
            <span className="font-bold text-xl tracking-tight text-[#2C0D36]">Veira</span>
          </div>
        </div>

        <div className="w-full max-sm:px-4 max-w-sm space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-2 font-display">Sign In</h1>
            <p className="text-xs md:text-sm text-slate-400">Welcome back! Please sign in to your shop.</p>
          </div>

          <div className="space-y-4 md:space-y-6">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Your Job Role</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                   {[UserRole.OWNER, UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.ACCOUNTANT].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`px-3 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                          selectedRole === role
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {getDisplayRole(role)}
                      </button>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Employee Name / ID" 
                  className="w-full px-6 py-4 md:py-5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 transition-all text-sm font-medium"
                />
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Secret PIN" 
                    defaultValue="••••"
                    className="w-full px-6 py-4 md:py-5 pr-14 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 transition-all text-sm font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors p-1"
                    title={showPassword ? "Hide PIN" : "Show PIN"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
             </div>
          </div>

          <button
            onClick={() => onLogin(selectedRole)}
            className="w-full py-4 md:py-5 bg-[#2C0D36] text-white rounded-[1.5rem] md:rounded-[2rem] font-bold text-sm shadow-xl shadow-[#2C0D36]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Sign In
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          
          <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">Veira v2.5.4</p>
        </div>

        <div className="mt-12 lg:absolute lg:bottom-8 lg:left-8 lg:right-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
           <p>© 2026 Veira POS</p>
           <div className="flex gap-6">
              <a 
                href="https://wa.me/254755792377" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-slate-900 transition-colors"
              >
                Help
              </a>
              <button className="hover:text-slate-900">Legal</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
