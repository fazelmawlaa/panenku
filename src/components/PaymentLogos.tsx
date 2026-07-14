import React from "react";

export interface PaymentMethodInfo {
  id: string;
  name: string;
  type: "bank" | "ewallet";
  color: string;
  logo: React.ReactNode;
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: "BCA",
    name: "BCA Transfer",
    type: "bank",
    color: "bg-blue-600",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-white rounded border border-slate-100 p-0.5 select-none shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" 
          alt="BCA" 
          className="h-3.5 object-contain"
        />
      </div>
    )
  },
  {
    id: "BSI",
    name: "BSI Transfer",
    type: "bank",
    color: "bg-teal-600",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-white rounded border border-slate-100 p-0.5 select-none shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg" 
          alt="BSI" 
          className="h-5 object-contain"
        />
      </div>
    )
  },
  {
    id: "BRI",
    name: "BRI Transfer",
    type: "bank",
    color: "bg-blue-700",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-white rounded border border-slate-100 p-0.5 select-none shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg" 
          alt="BRI" 
          className="h-2.5 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML = '<div class="text-[#00509E] font-sans font-black text-[9px] tracking-tighter">bank BRI</div>';
          }}
        />
      </div>
    )
  },
  {
    id: "Mandiri",
    name: "Mandiri Transfer",
    type: "bank",
    color: "bg-blue-900",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-white rounded border border-slate-100 p-0.5 select-none shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" 
          alt="Mandiri" 
          className="h-3.5 object-contain"
        />
      </div>
    )
  },
  {
    id: "DANA",
    name: "DANA",
    type: "ewallet",
    color: "bg-sky-500",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-white rounded border border-slate-100 p-0.5 select-none shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" 
          alt="DANA" 
          className="h-3 object-contain"
        />
      </div>
    )
  },
  {
    id: "OVO",
    name: "OVO",
    type: "ewallet",
    color: "bg-purple-600",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-white rounded border border-slate-100 p-0.5 select-none shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg" 
          alt="OVO" 
          className="h-3.5 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML = '<div class="bg-[#4C2A86] text-white px-2 py-0.5 rounded-full font-sans font-extrabold text-[8px] tracking-wider scale-90">OVO</div>';
          }}
        />
      </div>
    )
  },
  {
    id: "ShopeePay",
    name: "ShopeePay",
    type: "ewallet",
    color: "bg-orange-600",
    logo: (
      <div className="flex items-center justify-center h-6 w-16 bg-[#EE4D2D] rounded select-none shrink-0 shadow-sm border border-[#EE4D2D] gap-0.5">
        <span className="text-white font-sans font-black text-[7px] tracking-tighter leading-none">Shopee</span>
        <span className="text-white font-sans font-light text-[7px] tracking-tighter leading-none">Pay</span>
      </div>
    )
  }
];

export function renderPaymentLogo(id: string) {
  const method = PAYMENT_METHODS.find((m) => m.id === id);
  if (method) return method.logo;
  return (
    <div className="px-2 py-1 rounded bg-secondary text-foreground font-sans font-bold text-[9px] border border-border/40 select-none shrink-0 shadow-sm">
      {id}
    </div>
  );
}
