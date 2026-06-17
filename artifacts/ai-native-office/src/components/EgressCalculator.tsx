import React, { useState } from "react";

export const EgressCalculator: React.FC = () => {
  const [tb, setTb] = useState(5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const monthlyTb = tb * 30;
  const monthlyAws = monthlyTb * 1000 * 0.085;

  return (
    <div className="no-print border border-border p-6 my-10 bg-card font-mono text-sm">
      <div className="mb-8 border-b border-border pb-6">
        <label className="block text-muted-foreground uppercase mb-4 tracking-widest text-xs">
          Daily Multimodal Data Generation
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="50"
            value={tb}
            onChange={(e) => setTb(Number(e.target.value))}
            className="w-full h-1 bg-border appearance-none cursor-pointer brutalist-slider"
          />
          <span className="text-xl font-bold w-16 text-right shrink-0">{tb} TB</span>
        </div>
        <div className="text-muted-foreground text-xs mt-3">
          ≈ {monthlyTb.toLocaleString()} TB / month transmitted to public cloud
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* AWS — terminal receipt / invoice */}
        <div className="border border-dashed border-border p-5 bg-background flex flex-col">
          <div className="flex items-center justify-between border-b border-dashed border-border pb-2 mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Public Cloud (AWS)</span>
            <span>Invoice</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Egress @ $0.085/GB</span>
            <span>{monthlyTb.toLocaleString()} TB</span>
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Monthly Transit Tax
            </span>
            <span className="text-3xl font-bold text-destructive">{formatCurrency(monthlyAws)}</span>
          </div>
          <div className="mt-3 text-destructive text-xs leading-snug">
            * Capital effectively destroyed. Zero computational value generated.
          </div>
        </div>

        {/* Edge Node — sovereign */}
        <div className="border border-primary p-5 bg-primary text-primary-foreground flex flex-col">
          <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2 mb-3 text-[10px] uppercase tracking-widest text-primary-foreground/70">
            <span>Edge Node (Sovereign)</span>
            <span>On-Prem</span>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70 mb-1">
              Edge Node Egress Cost
            </div>
            <div className="text-3xl font-bold">$0.00</div>
            <div className="mt-3 text-xs border-t border-primary-foreground/20 pt-3 font-bold">
              Absolute Sovereignty — data never crosses a public boundary.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
