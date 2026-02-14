
import React from 'react';
import { Category, Product, Transaction, PaymentMethod } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Jogoo Maize Flour 2kg', price: 210, cost: 185, stock: 45, category: Category.FOOD, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'Broadways Bread 400g', price: 65, cost: 52, stock: 20, category: Category.FOOD, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
  { id: '3', name: 'Brookside Milk 500ml', price: 60, cost: 48, stock: 35, category: Category.FOOD, imageUrl: 'https://images.unsplash.com/photo-1550583724-125581cc25fb?auto=format&fit=crop&w=200&q=80' },
  { id: '4', name: 'Kasuku Gas Refill 6kg', price: 1200, cost: 980, stock: 8, category: Category.HOUSEHOLD, imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=200&q=80' },
  { id: '5', name: 'Mumias Sugar 1kg', price: 180, cost: 155, stock: 15, category: Category.FOOD, imageUrl: 'https://images.unsplash.com/photo-1581447100595-377319e45738?auto=format&fit=crop&w=200&q=80' },
  { id: '6', name: 'Safaricom Airtime 1000', price: 1000, cost: 950, stock: 100, category: Category.SERVICES, imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=200&q=80' },
  { id: '7', name: 'Menengai Soap 800g', price: 150, cost: 120, stock: 30, category: Category.HOUSEHOLD, imageUrl: 'https://images.unsplash.com/photo-1605264964528-06403738d6dc?auto=format&fit=crop&w=200&q=80' },
  { id: '8', name: 'Indomie Chicken 5-pack', price: 250, cost: 210, stock: 25, category: Category.FOOD, imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=200&q=80' },
];

export const generateMockTransactions = (products: Product[]): Transaction[] => {
  const txs: Transaction[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 14; i++) {
    const dayTimestamp = now - (i * dayMs);
    const numSales = 8 + Math.floor(Math.random() * 12);

    for (let j = 0; j < numSales; j++) {
      const saleTimestamp = dayTimestamp - (Math.random() * dayMs * 0.8);
      const randomItems = products
        .sort(() => 0.5 - Math.random())
        .slice(0, 1 + Math.floor(Math.random() * 4));
      
      const cartItems = randomItems.map(p => ({
        ...p,
        quantity: 1 + Math.floor(Math.random() * 3)
      }));

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const costOfGoods = cartItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
      const vat = subtotal * 0.16;
      
      const methods = [PaymentMethod.MPESA, PaymentMethod.CASH, PaymentMethod.CARD];
      const method = methods[Math.floor(Math.random() * methods.length)];

      let isAnomaly = false;
      let anomalyReason = '';
      let total = subtotal + vat;

      if ((i + j) % 15 === 0) {
        isAnomaly = true;
        if (j % 2 === 0) {
          total += 450;
          anomalyReason = 'Variance Detected: Calculated total (KES ' + (subtotal + vat).toFixed(0) + ') does not match recorded tender (KES ' + total.toFixed(0) + ')';
        } else {
          anomalyReason = 'Price Override: Cashier applied unauthorized discount below floor price.';
        }
      }

      txs.push({
        id: `VRA-${i}${j}-${Math.floor(Math.random() * 999)}`,
        timestamp: saleTimestamp,
        items: cartItems,
        total,
        vat,
        costOfGoods,
        paymentMethod: method,
        isAnomaly,
        anomalyReason
      });
    }
  }
  return txs.sort((a, b) => b.timestamp - a.timestamp);
};

export const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  ),
  POS: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h18"/><path d="M19 10V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m11 15 2 2 4-4"/>
    </svg>
  ),
  Inventory: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  Reports: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
  ),
  Compliance: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  Staff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Alerts: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  Profit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Assistant: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/><path d="M15 3a4 4 0 0 0 4 4"/><path d="m15 15 2 2 4-4"/>
    </svg>
  ),
  Mic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  Stop: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="5" y="5" rx="2"/>
    </svg>
  )
};

export const QUICK_PROMPTS = [
  "Show me today's revenue and profit.",
  "Are there any unusual transactions this week?",
  "Provide a reconciliation between cash and M-PESA.",
  "Generate a monthly profit & loss summary.",
  "Which items have the highest cost impact?"
];
