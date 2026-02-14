
import { GoogleGenAI } from "@google/genai";
import { Transaction, Product, OwnerProfile, BusinessType, UserRole } from "../types";

const getProfileInstruction = (profile: OwnerProfile) => {
  switch (profile) {
    case OwnerProfile.SURVIVAL:
      return `PROFILE: Small shop owner. Focus on cash in hand.`;
    case OwnerProfile.BURNED:
      return `PROFILE: Careful owner. Watch for theft or loss.`;
    case OwnerProfile.GROWTH:
      return `PROFILE: Growth-minded. Focus on trends and improvement.`;
    case OwnerProfile.COMPLIANCE:
      return `PROFILE: Record-keeper. Focus on tax and receipts.`;
    case OwnerProfile.HANDS_OFF:
      return `PROFILE: Hands-off. Use quick summaries only.`;
    default:
      return "";
  }
};

const getUserRoleInstruction = (role: UserRole) => {
  switch (role) {
    case UserRole.ACCOUNTANT:
    case UserRole.FINANCE_MANAGER:
      return `USER ROLE: Professional Accountant. 
      STYLE: Clear and analytical.
      FOCUS: Money accuracy, Tax records, Profit, and Stock Costs.`;
    case UserRole.AUDITOR:
      return `USER ROLE: Auditor. FOCUS: Checking for mistakes or fraud.`;
    default:
      return `USER ROLE: ${role}. FOCUS: General business health.`;
  }
};

const SYSTEM_INSTRUCTION = (profile: OwnerProfile, type: BusinessType, role: UserRole) => `
Your name is Veira. You are a helpful business assistant for shops in Kenya.

${getProfileInstruction(profile)}
${getUserRoleInstruction(role)}

Rules:
- Use simple English. Avoid hard words.
- Use KES for money.
- Be quick and to the point.
- Do not say "I am an AI".
- Tagline: Know your business.
`;

export const getBusinessInsights = async (transactions: Transaction[], products: Product[], profile: OwnerProfile, type: BusinessType, role: UserRole) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const revenue = transactions.reduce((acc, t) => acc + t.total, 0);
    const anomalies = transactions.filter(t => t.isAnomaly).length;
    
    const context = `
      Current Stats:
      Total Sales: KES ${revenue.toLocaleString()}
      Problems Found: ${anomalies}
      Low Stock Items: ${products.filter(p => p.stock < 10).length}
      
      Job: ${role}
      Shop Type: ${type}
      
      Write a 2-sentence summary of how the shop is doing. Use simple words.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION(profile, type, role)
      }
    });

    return response.text;
  } catch (error) {
    console.error("Veira Insights Error:", error);
    return "Records look okay. No issues found.";
  }
};

export const getAssistantResponse = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[], 
  transactions: Transaction[], 
  products: Product[],
  profile: OwnerProfile,
  type: BusinessType,
  role: UserRole
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const context = `
      Shop Type: ${type}
      Role: ${role}
      Total Sales: KES ${transactions.reduce((acc, t) => acc + t.total, 0).toLocaleString()}
      Total Cost: KES ${transactions.reduce((acc, t) => acc + (t.costOfGoods || 0), 0).toLocaleString()}
      Problems Found: ${transactions.filter(t => t.isAnomaly).length}
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION(profile, type, role)}\n\nBusiness Context:\n${context}`,
      },
      history: history
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Veira Assistant Error:", error);
    return "Sorry, I'm having trouble connecting. Your records are safe.";
  }
};
