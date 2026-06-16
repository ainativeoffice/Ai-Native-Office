import React, { useState } from "react";
import { motion } from "framer-motion";

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

  const monthlyAws = tb * 30 * 1000 * 0.085;
  const monthlyEdge = 0;

  return (
    <div className="border border-border p-6 my-10 bg-card font-mono text-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border pb-6 gap-6">
        <div className="w-full md:w-1/2">
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
        </div>
        
        <div className="w-full md:w-1/2 md:text-right">
          <div className="text-muted-foreground uppercase mb-2 tracking-widest text-xs">Monthly Transit Tax</div>
          <div className="text-4xl text-destructive font-bold">{formatCurrency(monthlyAws)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-border bg-background">
          <div className="text-muted-foreground uppercase text-xs mb-2">Public Cloud (AWS)</div>
          <div className="text-2xl">{formatCurrency(monthlyAws)}</div>
          <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">Extortionate rent-seeking model</div>
        </div>
        <div className="p-4 border border-primary bg-primary text-primary-foreground relative overflow-hidden">
          <div className="uppercase text-xs mb-2 text-primary-foreground/70">Edge Node (Sovereign)</div>
          <div className="text-2xl font-bold">{formatCurrency(monthlyEdge)}</div>
          <div className="text-xs mt-2 border-t border-primary-foreground/20 pt-2 font-bold">Absolute Sovereignty</div>
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};
