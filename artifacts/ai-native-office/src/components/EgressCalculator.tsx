import React, { useState } from "react";

export const EgressCalculator: React.FC = () => {
  const [dailyTB, setDailyTB] = useState(5);
  const [inferenceMix, setInferenceMix] = useState(30);
  const [storageSplit, setStorageSplit] = useState(20);

  const AWS_EGRESS_RATE = 0.085;
  const LIGHTPATH_EGRESS_RATE = 0.01;
  const FRONTIER_API_RATE = 0.015;
  const CLOUD_STORAGE_RATE = 0.023;

  const monthlyTB = dailyTB * 30;
  const monthlyGB = monthlyTB * 1000;
  const cloudShareFraction = inferenceMix / 100;
  const cloudEgressGB = monthlyGB * cloudShareFraction;
  const lightpathEgressGB = monthlyGB * (1 - cloudShareFraction);
  const TOKENS_PER_GB = 750000;
  const frontierTokensM = (cloudEgressGB * TOKENS_PER_GB) / 1e6;
  const frontierAPICost = frontierTokensM * FRONTIER_API_RATE;
  const cloudStorageGB = monthlyGB * (storageSplit / 100);
  const cloudStorageCost = cloudStorageGB * CLOUD_STORAGE_RATE;
  const cloudEgressCost = cloudEgressGB * AWS_EGRESS_RATE;
  const totalCloudMonthly = cloudEgressCost + frontierAPICost + cloudStorageCost;
  const lightpathEgressCost = lightpathEgressGB * LIGHTPATH_EGRESS_RATE;
  const totalSovereignMonthly = lightpathEgressCost;
  const annualDelta = (totalCloudMonthly - totalSovereignMonthly) * 12;
  const savingsPct =
    totalCloudMonthly > 0
      ? Math.round(((totalCloudMonthly - totalSovereignMonthly) / totalCloudMonthly) * 100)
      : 0;

  const usd = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const usdExact = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="no-print border border-border p-6 my-10 bg-card font-mono text-sm">
      <div className="mb-6 border-b border-border pb-6">
        <label className="block text-muted-foreground uppercase mb-4 tracking-widest text-xs">
          Daily Multimodal Data Generation
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="50"
            className="w-full h-1 bg-border appearance-none cursor-pointer brutalist-slider"
            value={dailyTB}
            onChange={(e) => setDailyTB(Number(e.target.value))}
          />
          <span className="text-xl font-bold w-16 text-right shrink-0">{dailyTB} TB</span>
        </div>
        <div className="text-muted-foreground text-xs mt-3">
          ≈ {monthlyTB} TB / month total data generated
        </div>
      </div>

      <div className="mb-6 border-b border-border pb-6">
        <label className="block text-muted-foreground uppercase mb-4 tracking-widest text-xs">
          Inference Mix — Local vs. Frontier
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full h-1 bg-border appearance-none cursor-pointer brutalist-slider"
            value={inferenceMix}
            onChange={(e) => setInferenceMix(Number(e.target.value))}
          />
          <span className="text-xl font-bold w-24 text-right shrink-0">
            {100 - inferenceMix}% / {inferenceMix}%
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground text-xs mt-2">
          <span>← 100% Local (Sovereign)</span>
          <span>100% Frontier API →</span>
        </div>
      </div>

      <div className="mb-8 border-b border-border pb-6">
        <label className="block text-muted-foreground uppercase mb-4 tracking-widest text-xs">
          Storage — Local vs. Cloud
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full h-1 bg-border appearance-none cursor-pointer brutalist-slider"
            value={storageSplit}
            onChange={(e) => setStorageSplit(Number(e.target.value))}
          />
          <span className="text-xl font-bold w-24 text-right shrink-0">
            {100 - storageSplit}% / {storageSplit}%
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground text-xs mt-2">
          <span>← 100% Local</span>
          <span>100% Cloud Storage →</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6">
        <div className="border border-dashed border-border p-5 bg-background flex flex-col">
          <div className="flex items-center justify-between border-b border-dashed border-border pb-2 mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Public Cloud (AWS)</span>
            <span>Invoice</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Egress @ $0.085/GB</span>
            <span>{Math.round(cloudEgressGB).toLocaleString()} GB</span>
          </div>
          <div className="flex justify-between text-xs text-destructive mb-1">
            <span></span>
            <span>{usd(cloudEgressCost)}</span>
          </div>
          <div className="my-2 border-t border-dashed border-border"></div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Frontier API ({inferenceMix}% of workload)</span>
            <span>{frontierTokensM.toFixed(1)}M tokens</span>
          </div>
          <div className="flex justify-between text-xs text-destructive mb-1">
            <span>@ $0.015/M tokens</span>
            <span>{usd(frontierAPICost)}</span>
          </div>
          <div className="my-2 border-t border-dashed border-border"></div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Cloud Storage ({storageSplit}% of data)</span>
            <span>{Math.round(cloudStorageGB).toLocaleString()} GB</span>
          </div>
          <div className="flex justify-between text-xs text-destructive mb-1">
            <span>@ $0.023/GB/mo</span>
            <span>{usd(cloudStorageCost)}</span>
          </div>
          <div className="my-3 border-t border-dashed border-border"></div>
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Monthly Total
            </span>
            <span className="text-3xl font-bold text-destructive">{usd(totalCloudMonthly)}</span>
          </div>
          <div className="mt-3 text-destructive text-xs leading-snug">
            * Capital effectively destroyed. Zero computational value generated.
          </div>
        </div>

        <div className="border border-primary p-5 bg-primary text-primary-foreground flex flex-col">
          <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2 mb-3 text-[10px] uppercase tracking-widest text-primary-foreground/70">
            <span>AI-Native Office (Sovereign)</span>
            <span>On-Prem</span>
          </div>
          <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
            <span>Lightpath Egress @ $0.010/GB</span>
            <span>{Math.round(lightpathEgressGB).toLocaleString()} GB</span>
          </div>
          <div className="flex justify-between text-xs text-primary-foreground mb-1">
            <span></span>
            <span>{usdExact(lightpathEgressCost)}</span>
          </div>
          <div className="my-2 border-t border-primary-foreground/20"></div>
          <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
            <span>Local Inference ({100 - inferenceMix}% of workload)</span>
            <span>Sovereign Node</span>
          </div>
          <div
            className="flex justify-between text-xs text-primary-foreground mb-1 cursor-help"
            title="Zero marginal cost — inference runs on tenant-owned silicon. Hardware cost is amortized CapEx, not billed per token."
          >
            <span>$0.00 marginal ⓘ</span>
            <span>$0.00</span>
          </div>
          <div className="my-2 border-t border-primary-foreground/20"></div>
          <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
            <span>Local Storage ({100 - storageSplit}% of data)</span>
            <span>On-Prem</span>
          </div>
          <div
            className="flex justify-between text-xs text-primary-foreground mb-1 cursor-help"
            title="Zero marginal cost — on-premises storage is depreciable capital infrastructure, not a recurring SaaS line item."
          >
            <span>$0.00 marginal ⓘ</span>
            <span>$0.00</span>
          </div>
          <div className="my-3 border-t border-primary-foreground/20"></div>
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-widest text-primary-foreground/70">
              Monthly Total
            </span>
            <span className="text-3xl font-bold">{usdExact(totalSovereignMonthly)}</span>
          </div>
          <div className="mt-3 text-xs border-t border-primary-foreground/20 pt-3 font-bold">
            Absolute Sovereignty — data never crosses a public boundary.
          </div>
        </div>
      </div>

      <div className="border border-border p-5 bg-background">
        <div className="flex items-center justify-between border-b border-dashed border-border pb-3 mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Annual Sovereignty Dividend</span>
          <span className="text-primary font-bold text-base">{usd(annualDelta)}</span>
        </div>
        <div className="w-full bg-border h-2 mb-3">
          <div
            className="bg-primary h-2 transition-all duration-300"
            style={{ width: `${Math.min(savingsPct, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground">
          At this workload profile, the AI-Native Office costs{" "}
          <span className="text-primary font-bold">{savingsPct}% less per year</span> than equivalent
          public cloud infrastructure.{" "}
          <span className="opacity-60">
            Lightpath egress @ $0.010/GB vs. AWS @ $0.085/GB — {Math.round((1 - 0.01 / 0.085) * 100)}¢
            on the dollar.
          </span>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-muted-foreground leading-relaxed opacity-60">
        Assumptions: AWS egress $0.085/GB · Dedicated private fiber $0.010/GB · Frontier API
        $0.015/M tokens (GPT-4o class) · Cloud storage $0.023/GB/mo (S3 standard) · Local inference
        and local storage at zero marginal cost (tenant-owned CapEx). Model is illustrative; actual
        costs vary by workload profile and contract.
      </div>
    </div>
  );
};
