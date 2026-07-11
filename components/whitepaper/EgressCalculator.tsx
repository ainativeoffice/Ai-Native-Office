"use client";

import { useState } from "react";

const MONTHLY_DAYS = 30;
const CLOUD_EGRESS_RATE = 0.09; // USD per GB (AWS standard)
const CLOUD_API_RATE = 0.01; // USD per 1k tokens (GPT-4 approx)
const TOKENS_PER_GB = 500_000; // avg tokens per GB of text

/**
 * Interactive egress-cost calculator rendered inside the "Economics" section.
 * Lets the reader dial in their inference volume and see the monthly cloud cost
 * vs. zero for sovereign on-prem.
 */
export function EgressCalculator() {
  const [gbPerDay, setGbPerDay] = useState(10);
  const [tokensPerDay, setTokensPerDay] = useState(1_000_000);

  const monthlyEgress = gbPerDay * MONTHLY_DAYS * CLOUD_EGRESS_RATE;
  const monthlyApiCost = (tokensPerDay / 1000) * MONTHLY_DAYS * CLOUD_API_RATE;
  const totalMonthly = monthlyEgress + monthlyApiCost;
  const totalAnnual = totalMonthly * 12;

  return (
    <div className="my-10 border border-border bg-card/30 p-6 md:p-8 font-mono">
      <div className="mb-6 text-[10px] uppercase tracking-[0.2em] text-[#FF5F1F]">
        ▚ Cloud Egress Cost Calculator
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div>
          <label className="block mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Data egress per day (GB)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={500}
              value={gbPerDay}
              onChange={(e) => setGbPerDay(Number(e.target.value))}
              className="brutalist-slider flex-1 appearance-none h-1 bg-border outline-none cursor-pointer"
              aria-label="Data egress per day in gigabytes"
            />
            <span className="w-16 text-right text-sm text-foreground">{gbPerDay} GB</span>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Tokens per day (inference)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={10_000}
              max={50_000_000}
              step={10_000}
              value={tokensPerDay}
              onChange={(e) => setTokensPerDay(Number(e.target.value))}
              className="brutalist-slider flex-1 appearance-none h-1 bg-border outline-none cursor-pointer"
              aria-label="Tokens per day"
            />
            <span className="w-24 text-right text-sm text-foreground">
              {(tokensPerDay / 1_000_000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-px border border-border bg-border md:grid-cols-3">
        <div className="bg-background p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Monthly egress</div>
          <div className="text-2xl font-bold text-foreground">${monthlyEgress.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-background p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Monthly API cost</div>
          <div className="text-2xl font-bold text-foreground">${monthlyApiCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-background p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Annual cloud spend</div>
          <div className="text-2xl font-bold text-[#FF5F1F]">${totalAnnual.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
        Sovereign on-prem cost: $0.00/yr egress · rates: AWS $0.09/GB egress, $0.01/1k tokens
      </div>
    </div>
  );
}
