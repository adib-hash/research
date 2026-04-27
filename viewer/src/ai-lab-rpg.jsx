import { useState, useEffect, useRef, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

/* ============================================================
   AETHERIA AI — A FRONTIER LAB IN 18 MONTHS
   An interactive role-playing site about AI economics, 2026.
   Stack: React + Recharts. Single-file artifact.
   ============================================================ */

const C = {
  bg: "#05070d",
  surface: "#0b0e17",
  card: "#121722",
  cardH: "#1a2131",
  accent: "#60a5fa",
  accent2: "#8b5cf6",
  emerald: "#34d399",
  gold: "#f59e0b",
  red: "#ef4444",
  rose: "#fb7185",
  text: "#e8ecf4",
  dim: "#9ca9bd",
  muted: "#6b7790",
  faint: "#1a2030",
  border: "#1e2535",
  glow: "rgba(96,165,250,0.06)",
  glowV: "rgba(139,92,246,0.07)",
};

/* ============================================================
   DECISIONS — data-driven game definition
   ============================================================ */

const RETRO_DECISION_IDS = ["compute","datacenter","architecture","data","talent","inference","product","openness","pricing"];

const DECISIONS = [
  {
    id: "compute",
    act: "build",
    chapter: "01",
    title: "Pick your silicon",
    setup:
      "The first $850M of capex moves before the first line of training code. Every frontier lab in 2026 is making the same call: rent NVIDIA, lock into Google's TPU stack, or split the difference and pay twice.",
    options: [
      {
        id: "nvidia_rubin",
        name: "NVIDIA Rubin · multi-cloud",
        tagline: "The default. Buy the best GPUs available, run them anywhere.",
        stats: [
          { k: "Training capex", v: "−$780M" },
          { k: "$/Mtok floor", v: "$4.00" },
          { k: "Lock-in", v: "Low" },
        ],
        bullets: [
          "CUDA ecosystem: deepest hiring pool, fastest research iteration, runs on every cloud.",
          "NVIDIA keeps a 75% gross margin on every chip. You pay it.",
          "Pairs with NVIDIA's Vera CPU stack at serving — the only setup where agentic queries run efficiently.",
        ],
        effects: { budget: -780, capability: 18, infFloor: 4.0, lockIn: "nvidia", trainSpeed: 1.0, vendor: "NVIDIA" },
      },
      {
        id: "google_tpu",
        name: "Google TPU v8t · vertically integrated",
        tagline: "Cheaper to train, cheaper to serve — if you can stomach the lock-in.",
        stats: [
          { k: "Training capex", v: "−$540M" },
          { k: "$/Mtok floor", v: "$2.00" },
          { k: "Lock-in", v: "High" },
        ],
        bullets: [
          "30–50% capex savings vs NVIDIA. Google owns the chip, the optical fabric, and the power.",
          "Architecturally biased toward Mixture-of-Experts. MoE on TPU is the cheat code.",
          "Re-platforming to AWS later is a 6-month rewrite. Google knows this.",
        ],
        effects: { budget: -540, capability: 12, infFloor: 2.0, lockIn: "google", trainSpeed: 0.85, vendor: "Google" },
      },
      {
        id: "hybrid",
        name: "Hybrid · TPUs train, NVIDIA serves",
        tagline: "Pay both vendors. Optimize for nothing. Sleep at night.",
        stats: [
          { k: "Training capex", v: "−$680M" },
          { k: "$/Mtok floor", v: "$3.20" },
          { k: "Lock-in", v: "Medium" },
        ],
        bullets: [
          "TPUs for the production training run; NVIDIA for research experiments and the inference stack.",
          "Two stacks to staff, two contracts to negotiate, two sets of bugs.",
          "Best raw research velocity of any path. You will not be the lowest-cost producer.",
        ],
        effects: { budget: -680, capability: 17, infFloor: 3.2, lockIn: "mixed", trainSpeed: 0.95, vendor: "Hybrid" },
      },
    ],
  },
  {
    id: "datacenter",
    act: "build",
    chapter: "02",
    title: "Where the power comes from",
    setup:
      "Compute is what you see. Power is what you pay for. In 2026 the binding constraint on every frontier lab isn't chips — it's megawatts. The decision that determines your inference margin three years from now is being made right now, in a permitting office.",
    options: [
      {
        id: "hyperscaler_grid",
        name: "Hyperscaler co-lo · grid power",
        tagline: "Rent racks from a cloud provider. Available next quarter.",
        stats: [
          { k: "Power capex", v: "−$280M" },
          { k: "Power cost", v: "Market" },
          { k: "Time to first GW", v: "3 mo" },
        ],
        bullets: [
          "Fastest path to compute. No permits, no transformers on backorder.",
          "You pay the spot market price for electricity for the life of the model.",
          "When the grid tightens — and it will — your inference cost moves with it.",
        ],
        effects: { budget: -280, capability: 0, powerMult: 1.0, monthsDelay: 0 },
      },
      {
        id: "dedicated_smr",
        name: "Dedicated power · SMR + on-site substation",
        tagline: "Build your own. Permanently lower marginal cost.",
        stats: [
          { k: "Power capex", v: "−$520M" },
          { k: "Power cost", v: "−35%" },
          { k: "Time to first GW", v: "8 mo" },
        ],
        bullets: [
          "Small modular reactor partnership locks in baseload power for 20 years.",
          "Inference electricity drops ~35%. Power becomes a moat, not a bill.",
          "Three months of regulatory friction and you ship the model later than your competitor.",
        ],
        effects: { budget: -520, capability: 2, powerMult: 0.65, monthsDelay: 2 },
      },
      {
        id: "distributed",
        name: "Distributed · three regions, blended grid",
        tagline: "Spread risk across three campuses. Negotiate locally.",
        stats: [
          { k: "Power capex", v: "−$380M" },
          { k: "Power cost", v: "−15%" },
          { k: "Time to first GW", v: "5 mo" },
        ],
        bullets: [
          "Three campuses (Texas, Iowa, Quebec) hedge against any single grid getting tight.",
          "Networking overhead reduces effective throughput by ~5%.",
          "When one region's interconnect queue slips, the other two cover.",
        ],
        effects: { budget: -380, capability: 1, powerMult: 0.85, monthsDelay: 1 },
      },
    ],
  },
  {
    id: "architecture",
    act: "build",
    chapter: "03",
    title: "Dense, or mixture-of-experts",
    setup:
      "The architecture choice is a quiet one. The press will never write about it. But it determines how many parameters get activated for each token a user sends — and therefore what the bill looks like at 100 billion queries a month.",
    options: [
      {
        id: "dense",
        name: "Dense transformer",
        tagline: "Every parameter fires for every token. Simple. Expensive.",
        stats: [
          { k: "R&D capex", v: "−$250M" },
          { k: "Train time", v: "7 mo" },
          { k: "Inference cost", v: "Linear in size" },
        ],
        bullets: [
          "The architecture you read about in the GPT-3 paper. Predictable, well-understood.",
          "Inference cost scales linearly with parameter count. There is no escaping the bill.",
          "Easier to fine-tune, easier to debug, easier to explain to the board.",
        ],
        effects: { budget: -250, capability: 8, trainMonths: 7, archMult: 1.0 },
      },
      {
        id: "moe",
        name: "Mixture-of-experts",
        tagline: "Only some of the model fires per token. The TPU was built for this.",
        stats: [
          { k: "R&D capex", v: "−$280M" },
          { k: "Train time", v: "5 mo (on TPU)" },
          { k: "Inference cost", v: "≈30% lower" },
        ],
        bullets: [
          "Activates ~25% of parameters per token. Same capability, a fraction of the FLOPs.",
          "TPU v8t was designed for this — MoE on Google silicon trains 20% faster than dense.",
          "Harder to debug. When an expert misroutes, the failure mode is 'subtly worse output.'",
        ],
        effects: { budget: -280, capability: 9, trainMonths: 5, archMult: 0.75, requiresTPU: true },
      },
    ],
  },
  {
    id: "data",
    act: "build",
    chapter: "04",
    title: "The data is not free anymore",
    setup:
      "The web you trained on five years ago is now half AI-generated slop and the other half is behind a publisher paywall. RLHF teams want $200M for the year. Synthetic data startups will sell you a curriculum for less. Pick your poison; you'll see it again in the moderation bill.",
    options: [
      {
        id: "minimal_rlhf",
        name: "Minimal RLHF · scrape what we can",
        tagline: "Ship fast, moderate the output later.",
        stats: [
          { k: "Data capex", v: "−$80M" },
          { k: "Capability", v: "+6" },
          { k: "Hidden debt", v: "High" },
        ],
        bullets: [
          "$80M up front gets you a passable model on time.",
          "Safety and moderation costs in production will be 2× higher than the alternative.",
          "Every news cycle about your model saying something it shouldn't is now a P&L item.",
        ],
        effects: { budget: -80, capability: 6, safetyDebt: 0.4 },
      },
      {
        id: "heavy_rlhf",
        name: "Heavy RLHF · licensed corpus",
        tagline: "Pay publishers. Pay annotators. Get a better model.",
        stats: [
          { k: "Data capex", v: "−$320M" },
          { k: "Capability", v: "+18" },
          { k: "Hidden debt", v: "Low" },
        ],
        bullets: [
          "Multi-year deals with the FT, NYT, Springer; thousands of human annotators.",
          "Model is materially smarter on factual questions and harder to jailbreak.",
          "Your moderation costs in year one are a third of what they otherwise would be.",
        ],
        effects: { budget: -320, capability: 18, safetyDebt: -0.1 },
      },
      {
        id: "synthetic",
        name: "Synthetic-heavy curriculum",
        tagline: "Generate the training data with a smaller model.",
        stats: [
          { k: "Data capex", v: "−$150M" },
          { k: "Capability", v: "+10" },
          { k: "Hidden debt", v: "Medium" },
        ],
        bullets: [
          "Cheaper than licensing, more controllable than the open web.",
          "Distribution drift: the model is good at the questions you generated and worse at everything else.",
          "Works well for code and math; less well for the messy parts of human writing.",
        ],
        effects: { budget: -150, capability: 10, safetyDebt: 0.1 },
      },
    ],
  },
  {
    id: "talent",
    act: "build",
    chapter: "05",
    title: "Who actually does the work",
    setup:
      "An ML researcher who has trained a frontier model from scratch costs more than most senior bankers. You can hire forty of them and run a research org, partner with two universities and stay lean, or buy a ten-person lab and inherit their roadmap.",
    options: [
      {
        id: "big_inhouse",
        name: "Big in-house research org",
        tagline: "Forty senior researchers. Frontier work. $22M/month.",
        stats: [
          { k: "Hiring capex", v: "−$240M" },
          { k: "Capability", v: "+6" },
          { k: "Monthly opex", v: "+$22M" },
        ],
        bullets: [
          "Research throughput is real. You'll publish, you'll attract more talent, you'll compound.",
          "The monthly burn never stops. You're paying $264M/year before a single GPU runs.",
          "Coordination overhead grows superlinearly. The 41st researcher slows the other 40 down.",
        ],
        effects: { budget: -240, capability: 6, opex: 22 },
      },
      {
        id: "lean_academic",
        name: "Lean team + academic partnerships",
        tagline: "Twelve researchers, three university labs, a pre-print habit.",
        stats: [
          { k: "Hiring capex", v: "−$80M" },
          { k: "Capability", v: "+3" },
          { k: "Monthly opex", v: "+$8M" },
        ],
        bullets: [
          "Stanford, ETH, Oxford each get a multi-year compute grant in exchange for first look.",
          "Slower clock speed. Your team can't run as many experiments in parallel.",
          "If your big bet works, you ship. If it doesn't, you don't have a backup plan.",
        ],
        effects: { budget: -80, capability: 3, opex: 8 },
      },
      {
        id: "acquihire",
        name: "Acquihire a smaller lab",
        tagline: "Buy ten people who already know how to do this.",
        stats: [
          { k: "Acquisition", v: "−$190M" },
          { k: "Capability", v: "+5" },
          { k: "Monthly opex", v: "+$11M" },
        ],
        bullets: [
          "You inherit a working pipeline. Day-one productivity is real.",
          "You also inherit their architectural priors. Some of them won't fit your stack.",
          "Two of the founders leave inside 18 months. Plan for it.",
        ],
        effects: { budget: -190, capability: 5, opex: 11 },
      },
    ],
  },

  /* ====== Act 4: Launch decisions ====== */
  {
    id: "inference",
    act: "launch",
    chapter: "06",
    title: "What runs the model in production",
    setup:
      "Training is the entrance fee. Inference is the subscription. The chip you serve users on is going to determine whether your gross margin is 60% or negative — and over the model's 18-month life, you will spend more on inference than you did on training.",
    options: [
      {
        id: "tpu_v8i",
        name: "TPU v8i · inference-optimized",
        tagline: "$0.002 per query. The dedicated serving chip.",
        stats: [
          { k: "Capex", v: "−$180M" },
          { k: "Cost / query", v: "$0.0020" },
          { k: "Note", v: "Best with TPU training" },
        ],
        bullets: [
          "Designed for serving, not training. 80% better performance-per-dollar at chat throughput.",
          "If you trained on TPU v8t, deployment is a config change, not a port.",
          "If you trained on NVIDIA, deploying here costs an extra ~$250M port and bumps your serving cost ~60% — the model has to be re-distilled.",
        ],
        effects: { budget: -180, infCost: 0.002, requiresLockIn: "google" },
      },
      {
        id: "nvidia_blackwell",
        name: "NVIDIA Blackwell + Vera",
        tagline: "$0.0035 per query. Vera CPU halves agentic compute.",
        stats: [
          { k: "Capex", v: "−$300M" },
          { k: "Cost / query", v: "$0.0035" },
          { k: "Note", v: "Best for agentic" },
        ],
        bullets: [
          "Vera ARM CPUs handle the orchestration around Blackwell — agentic queries run at roughly half the compute of any other stack.",
          "More expensive than TPU v8i on raw chat throughput, but pulls ahead on anything multi-step.",
          "Multi-cloud portable. If you ever leave your training vendor, this is your exit.",
        ],
        effects: { budget: -300, infCost: 0.0035 },
      },
      {
        id: "reuse",
        name: "Reuse training silicon",
        tagline: "Don't buy more chips. Just serve from what you've got.",
        stats: [
          { k: "Capex", v: "−$0M" },
          { k: "Cost / query", v: "$0.0040" },
          { k: "Note", v: "Suboptimal" },
        ],
        bullets: [
          "Training chips are tuned for matmul throughput, not low-latency serving.",
          "Saves a quarter-billion of capex you don't have anyway.",
          "Inference cost lands ~2× higher than a dedicated stack would deliver.",
        ],
        effects: { budget: 0, infCost: 0.004 },
      },
    ],
  },
  {
    id: "product",
    act: "launch",
    chapter: "07",
    title: "What does the product actually do",
    setup:
      "An agentic query runs the model ten times to answer one question. A video generation request runs it a thousand. The product surface you ship determines the multiplier on every dollar of inference cost from launch day forward.",
    options: [
      {
        id: "chat_only",
        name: "Chat only",
        tagline: "One response per query. Simple. Cheap.",
        stats: [
          { k: "Cost mult", v: "1×" },
          { k: "Adoption", v: "Steady" },
          { k: "Margin", v: "Best" },
        ],
        bullets: [
          "The original ChatGPT product surface. Predictable cost, predictable revenue.",
          "Hard to differentiate from competitors. Race to the bottom on pricing.",
          "Highest gross margin you can ship. Lowest revenue ceiling.",
        ],
        effects: { featureMult: 1.0, demandMult: 1.0 },
      },
      {
        id: "chat_agentic",
        name: "Chat + agentic",
        tagline: "Multi-step reasoning. Tool use. Roughly 6× the compute.",
        stats: [
          { k: "Cost mult", v: "≈2.5×" },
          { k: "Adoption", v: "Strong" },
          { k: "Margin", v: "Tight" },
        ],
        bullets: [
          "Most queries trigger a tool call or two. Across the user base, that lands around 2.5× compute.",
          "Stickier product. Higher willingness-to-pay. Real differentiation.",
          "If your inference cost floor is high, this is the choice that exposes you.",
        ],
        effects: { featureMult: 2.5, demandMult: 1.4 },
      },
      {
        id: "chat_agentic_video",
        name: "Chat + agentic + video generation",
        tagline: "Sora-class video at $5–10 per minute. The headline-maker.",
        stats: [
          { k: "Cost mult", v: "≈4× blended" },
          { k: "Adoption", v: "Viral" },
          { k: "Margin", v: "Knife edge" },
        ],
        bullets: [
          "A single one-minute video query costs nearly as much as 1,000 chat queries — a small share of traffic, but a fat one.",
          "Media coverage, viral demos, premium pricing tier — the revenue ceiling lifts.",
          "Only viable if your inference cost floor is genuinely low. Otherwise it's the trap.",
        ],
        effects: { featureMult: 4.0, demandMult: 1.6 },
      },
    ],
  },
  {
    id: "openness",
    act: "launch",
    chapter: "07b",
    title: "Open weights, or closed",
    setup: "The most strategic decision frontier labs are making in 2026 isn't a chip choice — it's whether to release the model openly. Open weights means anyone can self-host. You lose API revenue. You gain developer mindshare, recruiting moat, and regulatory cover.",
    options: [
      {
        id: "closed",
        name: "Closed weights · API-only",
        tagline: "Standard frontier-lab playbook. The model lives on your servers.",
        stats: [
          { k: "Revenue capture", v: "Full" },
          { k: "Brand", v: "Standard" },
          { k: "Hiring moat", v: "Standard" },
        ],
        bullets: [
          "Every query goes through your infrastructure. You see the data, you set the price.",
          "The default for most US frontier labs in 2026.",
          "Easier to enforce safety policies, easier to monetize.",
        ],
        effects: { openWeights: false },
      },
      {
        id: "open_weights",
        name: "Open weights · permissive license",
        tagline: "Release the model. Let the community run it. Eat the revenue hit.",
        stats: [
          { k: "Revenue capture", v: "−40%" },
          { k: "Brand", v: "+50%" },
          { k: "Hiring moat", v: "+30%" },
        ],
        bullets: [
          "Demand for your hosted API jumps from developer ecosystem effects, but blended pricing drops as some users self-host.",
          "Top researchers want to publish. Open-weighting recruits the best of them.",
          "Regulatory scrutiny shifts: open weights are public; closed weights are proprietary obligations.",
        ],
        effects: { openWeights: true, demandMult: 1.5, priceMult: 0.6 },
      },
    ],
  },
  {
    id: "pricing",
    act: "launch",
    chapter: "08",
    title: "How you charge for it",
    setup:
      "Pricing is the last lever. Aggressive freemium gets you 100M weekly users and a hole in the P&L. Premium gets you fewer users at higher revenue per query. Enterprise gets you a sales cycle and the only contracts that look like real businesses.",
    options: [
      {
        id: "freemium",
        name: "Aggressive freemium",
        tagline: "Free tier for everyone. $20/mo paid tier. Subsidized.",
        stats: [
          { k: "Avg revenue / Mtok", v: "$3" },
          { k: "Demand", v: "1.6×" },
          { k: "Risk", v: "Cash burn" },
        ],
        bullets: [
          "Massive top-of-funnel. Brand becomes the product. ChatGPT-like trajectory.",
          "Most queries are free. Revenue per query is a third of premium pricing.",
          "Works only if inference cost is genuinely tiny. Otherwise you're paying users to use you.",
        ],
        effects: { pricePerMtok: 3, demandMult: 1.6 },
      },
      {
        id: "premium_api",
        name: "Premium API",
        tagline: "Developer-first. $8/Mtok. Pays for itself per call.",
        stats: [
          { k: "Avg revenue / Mtok", v: "$8" },
          { k: "Demand", v: "1.0×" },
          { k: "Risk", v: "Slower scale" },
        ],
        bullets: [
          "Standard frontier-lab pricing. Developers integrate, prosumers pay.",
          "Every query is gross-margin positive on day one if your stack is decent.",
          "Adoption is real but not viral. You're not a household name in year one.",
        ],
        effects: { pricePerMtok: 8, demandMult: 1.0 },
      },
      {
        id: "enterprise",
        name: "Enterprise-first",
        tagline: "Six-figure contracts. SLAs. Compliance. $20/Mtok blended.",
        stats: [
          { k: "Avg revenue / Mtok", v: "$20" },
          { k: "Demand", v: "0.4×" },
          { k: "Risk", v: "Sales cycle" },
        ],
        bullets: [
          "Fortune 500 deployments. SOC 2, on-prem, dedicated capacity.",
          "Three-quarter sales cycles. Revenue ramps slowly, then doesn't stop.",
          "The only model that produces a profitable quarter inside the first year.",
        ],
        effects: { pricePerMtok: 20, demandMult: 0.4 },
      },
    ],
  },
];

/* ============================================================
   simulate() — turns the player's choices into a P&L
   ============================================================ */

function simulate(picks, archetype, pivot, shocksOn) {
  const compute = pick(picks.compute, DECISIONS, "compute");
  const dc = pick(picks.datacenter, DECISIONS, "datacenter");
  const arch = pick(picks.architecture, DECISIONS, "architecture");
  const data = pick(picks.data, DECISIONS, "data");
  const talent = pick(picks.talent, DECISIONS, "talent");
  const inf = pick(picks.inference, DECISIONS, "inference");
  const prod = pick(picks.product, DECISIONS, "product");
  const openness = pick(picks.openness, DECISIONS, "openness");
  const price = pick(picks.pricing, DECISIONS, "pricing");

  const archMods = (archetype && archetype.modifiers) || {};
  const archBudget = (archetype && archetype.budget) || 3000;
  const archCapStart = (archetype && archetype.modifiers && archetype.modifiers.capStart) || 0;

  // Cross-vendor inference: NVIDIA training + TPU v8i serving (or vice versa)
  // costs an extra port + bumps inference cost. Models the real cost of
  // re-distilling a model onto a different hardware stack.
  let crossVendorPenalty = 0;
  let crossVendorInfMult = 1.0;
  let crossVendorFlag = false;
  if (inf && inf.effects.requiresLockIn && compute && compute.effects.lockIn !== inf.effects.requiresLockIn && compute.effects.lockIn !== "mixed") {
    crossVendorPenalty = 250;
    crossVendorInfMult = 1.6;
    crossVendorFlag = true;
  }

  // Training capex (build-phase decisions only) + cross-vendor port
  const dataAdj = data && data.id === "heavy_rlhf" && archMods.dataDiscount
    ? data.effects.budget * (1 - archMods.dataDiscount)
    : 0;
  const buildCapex = -1 * [compute, dc, arch, data, talent].reduce(
    (s, o) => s + (o ? o.effects.budget : 0), 0
  ) + dataAdj;
  const launchCapex = -1 * [inf].reduce(
    (s, o) => s + (o && o.effects.budget ? o.effects.budget : 0), 0
  );
  const trainingCost = buildCapex + crossVendorPenalty;

  // Train-time math
  const baseTrainMonths = arch ? arch.effects.trainMonths : 7;
  const speedMod = compute ? compute.effects.trainSpeed : 1;
  const moeOnTPU = arch && arch.effects.requiresTPU && compute && compute.effects.lockIn === "google";
  const archSpeedBoost = moeOnTPU ? 0.9 : 1;
  const monthsDelay = dc ? dc.effects.monthsDelay : 0;
  const trainMonths = Math.max(3, Math.round(baseTrainMonths * speedMod * archSpeedBoost + monthsDelay));

  // Capability — additive across all build choices, capped 0..100
  const capability = clamp(
    40 + archCapStart +
      (compute ? compute.effects.capability : 0) +
      (dc ? dc.effects.capability : 0) +
      (arch ? arch.effects.capability : 0) +
      (data ? data.effects.capability : 0) +
      (talent ? talent.effects.capability : 0),
    0, 100
  );

  // Inference cost floor: trained-on stack sets a floor, serving hardware sets a base.
  const infFloor = compute ? compute.effects.infFloor / 1000 : 0.005;
  const infBaseRaw = inf ? inf.effects.infCost : 0.005;
  const infBase = infBaseRaw * crossVendorInfMult;
  const infCost = Math.max(infBase, infFloor * 0.6);

  // Vera bonus: Blackwell + agentic = ~half the compute multiplier
  const veraEligible = inf && inf.id === "nvidia_blackwell" && prod && prod.id === "chat_agentic";
  const veraBonus = veraEligible ? 0.5 : 1.0;
  const featureMult = (prod ? prod.effects.featureMult : 1) * veraBonus;

  // archMult: MoE serving advantage applies only on TPU stack
  const archMult = moeOnTPU ? 0.75 : 1.0;

  const powerMult = dc ? dc.effects.powerMult : 1;
  const baseSafetyDebt = data ? data.effects.safetyDebt : 0.2;
  const safetyDebt = Math.max(-0.1, baseSafetyDebt - (archMods.safetyBonus || 0));

  // Research-velocity bonus on demand: NVIDIA stack ships papers and reference
  // integrations faster, modestly bumps adoption.
  const researchBonus = compute && compute.id === "nvidia_rubin" ? 1.05 : 1.0;

  const opennessDemandMult = openness && openness.effects.demandMult ? openness.effects.demandMult : 1.0;
  const archDemandBonus = archMods.demandBonus || 1.0;
  const demand = 100 *
    (capability / 70) *
    (prod ? prod.effects.demandMult : 1) *
    (price ? price.effects.demandMult : 1) *
    researchBonus *
    opennessDemandMult *
    archDemandBonus;

  // Time-to-market penalty: every month of training delay loses ramp.
  const ramPenalty = Math.max(0.7, 1 - 0.05 * monthsDelay);

  const pivotPick = pivot ? PIVOTS.find((p) => p.id === pivot) : null;
  const pivotEffects = (pivotPick && pivotPick.effects) || {};

  // Stochastic shocks (deterministic placement when toggle on)
  const shocks = shocksOn ? [
    { id: "grid_event", month: 5, len: 2, label: "Grid emergency", desc: "Heat wave + AI cluster demand collide. Spot power +50% for 8 weeks. Inference cost spikes.", powerMult: 1.5, irl: "ERCOT summer power crunch, 2024" },
    { id: "competitor_ipo", month: 11, len: 4, label: "Competitor IPO sucks oxygen", desc: "A rival's $50B IPO dominates the press for a quarter. Your top-of-funnel cools. Demand −15%.", demandMult: 0.85, irl: "Cohere IPO talk cycle, 2025" },
  ] : [];

  let peakMtokPerMonth = 0.8 * demand;
  const opennessPriceMult = openness && openness.effects.priceMult ? openness.effects.priceMult : 1.0;
  let pricePerMtok = (price ? price.effects.pricePerMtok : 8) * opennessPriceMult;
  const monthlyOpex = (talent ? talent.effects.opex : 8);

  const months = 18;
  const series = [];
  let cumProfit = 0;
  let infWallTriggered = false;

  let pivotApplied = false;
  let runtimeCapMult = 1.0; // capability boost as a demand multiplier proxy
  let runtimeAddCapex = 0;
  for (let m = 0; m < months; m++) {
    if (!pivotApplied && m === PIVOT_MONTH && pivotPick) {
      if (pivotEffects.demandMult) peakMtokPerMonth *= pivotEffects.demandMult;
      if (pivotEffects.priceMult) pricePerMtok *= pivotEffects.priceMult;
      if (pivotEffects.capBoost) runtimeCapMult *= 1 + pivotEffects.capBoost / 70;
      if (pivotEffects.addCapex) runtimeAddCapex += pivotEffects.addCapex;
      pivotApplied = true;
    }
    // Stochastic shock modifiers active this month
    let shockPowerMult = 1.0, shockDemandMult = 1.0;
    for (const sh of shocks) {
      if (m >= sh.month && m < sh.month + sh.len) {
        if (sh.powerMult) shockPowerMult *= sh.powerMult;
        if (sh.demandMult) shockDemandMult *= sh.demandMult;
      }
    }
    const t = (m - 6) / 3;
    const adoption = 1 / (1 + Math.exp(-t));
    const mtok = peakMtokPerMonth * adoption * ramPenalty * runtimeCapMult * shockDemandMult;
    const revenue = mtok * pricePerMtok;

    const safetyShare = 0.12 + safetyDebt;
    const baseShare = 0.4 + 0.25 + safetyShare + 0.23;
    // Soft cap on per-Mtok inference cost: any sane operator rate-limits before
    // blowing past 3× revenue per Mtok served.
    const naivePerMtok = infCost * 1000 * featureMult * archMult * baseShare;
    const totalInfPerMtok = Math.min(naivePerMtok, pricePerMtok * 3.0);
    const scaler = totalInfPerMtok / baseShare;

    const compCost = mtok * scaler * 0.4;
    const powerCost = mtok * scaler * 0.25 * powerMult * shockPowerMult;
    const safetyCost = mtok * scaler * safetyShare;
    const infraCost = mtok * scaler * 0.23;
    const trainAmort = (trainingCost + runtimeAddCapex) / months;
    const opex = monthlyOpex;
    const totalCost = compCost + powerCost + safetyCost + infraCost + trainAmort + opex;
    const profit = revenue - totalCost;
    cumProfit += profit;

    // Inference Wall: monthly serving cost exceeds monthly revenue
    if (!infWallTriggered && m >= 6 && (compCost + powerCost + infraCost) > revenue) {
      infWallTriggered = true;
    }

    series.push({
      month: m + 1,
      revenue: round(revenue),
      compute: round(compCost),
      power: round(powerCost),
      safety: round(safetyCost),
      infra: round(infraCost),
      trainAmort: round(trainAmort),
      opex: round(opex),
      cost: round(totalCost),
      profit: round(profit),
      cumProfit: round(cumProfit),
      mtok: round(mtok),
    });
  }

  const totalRevenue = series.reduce((s, x) => s + x.revenue, 0);
  const totalCost = series.reduce((s, x) => s + x.cost, 0);
  const totalCompute = series.reduce((s, x) => s + x.compute, 0);
  const totalPower = series.reduce((s, x) => s + x.power, 0);
  const totalSafety = series.reduce((s, x) => s + x.safety, 0);
  const totalInfra = series.reduce((s, x) => s + x.infra, 0);
  const totalAmort = series.reduce((s, x) => s + x.trainAmort, 0);
  const totalOpex = series.reduce((s, x) => s + x.opex, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : -1;

  // Adoption phases (for revenue-curve narration in the Reckoning section)
  const earlyRev = series.slice(0, 4).reduce((s, x) => s + x.revenue, 0);
  const midRev = series.slice(4, 9).reduce((s, x) => s + x.revenue, 0);
  const lateRev = series.slice(9).reduce((s, x) => s + x.revenue, 0);

  const events = buildEvents({
    picks, capability, infCost, featureMult, prod, price, compute, dc, data,
    inf, infWallTriggered, series, crossVendorFlag, moeOnTPU, veraEligible,
  });

  // Inject pivot result event
  if (pivotPick) {
    events.events.push({
      month: PIVOT_MONTH + 1,
      color: pivotPick.accent,
      title: `Pivot · ${pivotPick.name}`,
      text: pivotPick.body,
      irl: "Frontier-lab strategic pivot, vintage 2024–26",
    });
    events.events.sort((a, b) => a.month - b.month);
  }
  // Inject shock events
  for (const sh of shocks) {
    events.events.push({
      month: sh.month,
      color: "#fb7185",
      title: `Black swan · ${sh.label}`,
      text: sh.desc,
      irl: sh.irl,
    });
  }
  events.events.sort((a, b) => a.month - b.month);

  return {
    trainingCost, launchCapex, trainMonths, capability,
    infCostPerMtok: infCost * 1000 * featureMult * archMult,
    monthlyOpex, totalRevenue, totalCost,
    grossProfit, grossMargin,
    series, events, picks,
    pricePerMtok, featureMult, powerMult, safetyDebt,
    archMult, veraBonus, researchBonus,
    crossVendorPenalty, crossVendorFlag, monthsDelay, ramPenalty,
    moeOnTPU, veraEligible,
    archetype: archetype ? archetype.id : null,
    archetypeBudget: archBudget,
    openWeights: openness ? !!openness.effects.openWeights : false,
    pivot: pivot,
    shocksOn: !!shocksOn,
    infWallTriggered,
    breakdown: {
      revenue: totalRevenue,
      compute: totalCompute,
      power: totalPower,
      safety: totalSafety,
      infra: totalInfra,
      training: trainingCost,
      opex: totalOpex,
    },
    phases: {
      early: { months: "1–4", revenue: earlyRev, share: totalRevenue ? earlyRev / totalRevenue : 0 },
      mid:   { months: "5–9", revenue: midRev, share: totalRevenue ? midRev / totalRevenue : 0 },
      late:  { months: "10–18", revenue: lateRev, share: totalRevenue ? lateRev / totalRevenue : 0 },
    },
  };
}
function pick(id, list, decisionId) {
  if (!id) return null;
  const dec = list.find((d) => d.id === decisionId);
  if (!dec) return null;
  return dec.options.find((o) => o.id === id);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round(v) { return Math.round(v * 100) / 100; }

/* ============================================================
   EVENTS — narrative beats during training and live ops
   ============================================================ */

function buildEvents({ picks, capability, infCost, featureMult, prod, price, compute, dc, data, inf, infWallTriggered, series, crossVendorFlag, moeOnTPU, veraEligible }) {
  const events = [];
  const log = [];

  log.push({ day: 4, text: "First sustained loss curve. Within tolerance." });
  if (compute && compute.effects.lockIn === "google") {
    log.push({ day: 28, text: "TPU v8t hits 94% utilization on the new optical fabric. Google reps look pleased." });
  } else if (compute && compute.effects.lockIn === "nvidia") {
    log.push({ day: 22, text: "NVIDIA account team sends a fruit basket. The CFO sees the GPU bill." });
  } else if (compute && compute.effects.lockIn === "mixed") {
    log.push({ day: 31, text: "Hybrid stack: a JAX/PyTorch interop bug eats two weeks. Two account teams blame each other." });
  }
  if (moeOnTPU) {
    log.push({ day: 41, text: "MoE routing converges 18% faster than the dense baseline. The architecture team takes a victory lap." });
  }
  if (dc && dc.id === "dedicated_smr") {
    log.push({ day: 47, text: "NRC schedules its third public comment period. Lawyers are now on retainer." });
  }
  if (dc && dc.id === "hyperscaler_grid") {
    log.push({ day: 52, text: "Spot power +18% on a Texas heat dome. Training cost run-rate revised up." });
  }
  if (dc && dc.id === "distributed") {
    log.push({ day: 56, text: "Texas region transformer slips three weeks. Iowa and Quebec absorb the load." });
  }
  if (data && data.id === "minimal_rlhf") {
    log.push({ day: 89, text: "Internal red team breaks the model in a way that makes the Trust & Safety lead very quiet." });
  }
  if (data && data.id === "heavy_rlhf") {
    log.push({ day: 76, text: "Annotation team flags a systematic political-bias drift. Caught in time." });
  }
  if (data && data.id === "synthetic") {
    log.push({ day: 81, text: "Distribution drift on the synthetic curriculum: model is great at code, mediocre at humanities." });
  }
  log.push({ day: 110, text: "Eval suite shows the model surpassing the prior SOTA on " + (capability > 80 ? 9 : capability > 65 ? 7 : 5) + " of 12 benchmarks." });
  log.push({ day: 134, text: "Final checkpoint. The cluster is allowed to cool down." });

  // Live-ops events
  if (crossVendorFlag) {
    events.push({ month: 2, color: "#fb7185", title: "Cross-vendor port hits", text: "The re-distillation onto your serving hardware lands $250M heavier than budgeted, and your inference cost runs ~60% above the spec sheet for the first quarter.", irl: "Anthropic's TPU pivot, Dec 2024" });
  }
  if (prod && prod.id === "chat_agentic_video" && compute && compute.effects.lockIn !== "google") {
    events.push({ month: 3, color: "#ef4444", title: "The video bill arrives", text: "Generating one minute of video on a non-TPU stack costs $7.20 in compute alone. Marketing wants a viral campaign. Finance wants to talk.", irl: "Sora pricing leak, Feb 2025" });
  }
  if (veraEligible) {
    events.push({ month: 4, color: "#34d399", title: "Vera + Blackwell pays off", text: "Tool-calling agentic queries run roughly half the compute of a generic stack. Your gross margin on agentic traffic comes in materially above plan.", irl: "NVIDIA Vera CPU announcement, GTC 2025" });
  } else if (prod && prod.id === "chat_agentic" && infCost > 0.0030) {
    events.push({ month: 4, color: "#f59e0b", title: "Agentic loops eat the power budget", text: "Each user request triggers tool calls and retries that average 2.5× the compute of a chat query. The power line on your monthly P&L quietly becomes the largest.", irl: "Microsoft + Constellation nuclear deal, Sep 2024" });
  }
  if (price && price.id === "freemium" && infCost > 0.0025 && !moeOnTPU) {
    events.push({ month: 5, color: "#ef4444", title: "Freemium economics inverted", text: "Free-tier users send 4× the queries paid users do, and each one costs more than they generate. Every signup is a small loss.", irl: "Inflection AI pivot, Mar 2024" });
  }
  if (data && data.id === "minimal_rlhf") {
    events.push({ month: 7, color: "#f59e0b", title: "Trust & Safety becomes a P&L line", text: "Moderation contractors and legal review hit $14M/month. The shortcut on RLHF eight months ago is now visible in EBITDA.", irl: "Character.AI moderation lawsuits, 2024" });
  }
  events.push({ month: 9, color: "#60a5fa", title: "A competitor undercuts you", irl: "DeepSeek R1 release, Jan 2025", text: capability > 78 ? "A rival lab matches your capability and prices at 70% of yours. Your enterprise team holds; consumers churn." : "A rival ships a model that's 30% cheaper at similar capability. Your top-of-funnel slows for two months." });
  if (infWallTriggered) {
    events.push({ month: 12, color: "#ef4444", title: "The Inference Wall", text: "For the first time in a calendar quarter, you spend more serving the model than the model earns. The Information runs the headline.", irl: "Stability AI cash crunch, 2024" });
  }
  if (compute && compute.effects.lockIn === "google" && (price && price.id !== "freemium") && !infWallTriggered) {
    events.push({ month: 14, color: "#34d399", title: "Margin compounding", text: "Vertical integration pays. Power, silicon, and serving stack are one bill, and the bill keeps going down quarter over quarter.", irl: "Google Q4 2025 earnings call" });
  }
  if (compute && compute.effects.lockIn === "nvidia" && (price && price.id !== "freemium") && (prod && prod.id !== "chat_only") && !infWallTriggered) {
    events.push({ month: 14, color: "#34d399", title: "Research velocity shows up in the numbers", text: "Three model updates in nine months. Each cuts inference cost or lifts capability incrementally. Compounding ships ahead of the competition.", irl: "OpenAI's GPT-4 → 4-turbo → 4o cadence, 2023–24" });
  }
  events.push({
    month: 17,
    color: series[series.length - 1].cumProfit > 0 ? "#34d399" : "#fb7185",
    title: "Eighteen months in",
    text: series[series.length - 1].cumProfit > 0
      ? "The model has earned more than it cost. The board approves a successor training run."
      : "The model has lost money on a fully-loaded basis. The board wants to see a new plan.",
  });

  return { log, events };
}

/* ============================================================
   PRIMITIVES
   ============================================================ */

function FadeIn({ children, delay }) {
  const [vis, setVis] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay || 0}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay || 0}s`,
    }}>{children}</div>
  );
}

function CountUp({ value, prefix, suffix, decimals = 0, duration = 800 }) {
  const [v, setV] = useState(value);
  const startRef = useRef(value);
  const tRef = useRef();
  useEffect(() => {
    const from = startRef.current;
    const to = value;
    const start = performance.now();
    cancelAnimationFrame(tRef.current);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = from + (to - from) * eased;
      setV(cur);
      if (p < 1) tRef.current = requestAnimationFrame(tick);
      else startRef.current = to;
    };
    tRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(tRef.current);
  }, [value, duration]);
  const display = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return <span>{prefix || ""}{display}{suffix || ""}</span>;
}

function Glossary({ term, children, def }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        style={{
          borderBottom: `1px dashed ${C.accent}80`,
          cursor: "help",
          color: C.text,
        }}
      >{children || term}</span>
      {open && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", width: 280, zIndex: 50,
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "10px 12px",
          fontFamily: "var(--sans)", fontSize: 12, lineHeight: 1.5,
          color: C.dim, fontStyle: "normal", boxShadow: "0 12px 32px rgba(0,0,0,.7)",
          textAlign: "left", whiteSpace: "normal",
        }}>
          <div style={{ color: C.accent, fontSize: 10, letterSpacing: 1, marginBottom: 4, fontFamily: "var(--mono)", textTransform: "uppercase" }}>{term}</div>
          {def}
        </span>
      )}
    </span>
  );
}

function Chip({ children, color, sign }) {
  const c = color || C.accent;
  return <span style={{
    display: "inline-block", padding: "3px 9px", marginRight: 8,
    borderRadius: 999, background: c + "1f", color: c,
    fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
  }}>{sign}{children}</span>;
}

/* ============================================================
   HUD — sticky top bar with budget / capability / months
   ============================================================ */

function HUD({ state, launched }) {
  const budget = state.budget;
  const cap = state.capability;
  const months = state.monthsElapsed;
  const inf = state.infCostPerMtok;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
      background: "rgba(5,7,13,0.85)", backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div className="rpg-hud-grid" style={{
        maxWidth: 1100, margin: "0 auto", padding: "12px 24px",
        display: "grid", gridTemplateColumns: launched ? "1.2fr 1fr 1fr 1fr 1fr" : "1.4fr 1fr 1fr 1fr",
        gap: 12, alignItems: "center",
      }}>
        <div className="rpg-hud-brand">
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: C.accent, letterSpacing: 2, fontWeight: 700 }}>AETHERIA AI</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: C.muted, marginTop: 2 }}>frontier model · 2026</div>
        </div>
        <HudStat
          label="Budget"
          value={<CountUp value={budget} prefix="$" suffix="M" />}
          color={budget > 1500 ? C.emerald : budget > 600 ? C.gold : C.red}
        />
        <HudStat
          label="Capability"
          value={<CountUp value={cap} suffix="" />}
          color={cap > 75 ? C.accent : cap > 55 ? C.accent2 : C.muted}
        />
        <div className="rpg-hud-cell-hide-mobile">
          <HudStat
            label="Months"
            value={<CountUp value={months} suffix=" / 24" />}
            color={C.dim}
          />
        </div>
        {launched && (
          <div className="rpg-hud-cell-hide-mobile">
            <HudStat
              label="$ / Mtok"
              value={<CountUp value={inf} prefix="$" decimals={2} />}
              color={inf < 5 ? C.emerald : inf < 12 ? C.gold : C.red}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function HudStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--sans)", fontSize: 9, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 800, color: color || C.text, marginTop: 2, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function ProgressIndicator({ picks, phase }) {
  const allOrder = ["compute","datacenter","architecture","data","talent","inference","product","openness","pricing"];
  const made = allOrder.filter((id) => picks[id]).length;
  const total = allOrder.length;
  if (phase === "cold" || phase === "done") return null;
  return (
    <div style={{
      position: "fixed", top: 64, left: 0, right: 0, zIndex: 39,
      background: "rgba(5,7,13,0.7)", backdropFilter: "blur(10px)",
      borderBottom: `1px solid ${C.border}`,
      pointerEvents: "none",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "8px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: C.muted, letterSpacing: 1.5, fontWeight: 700, whiteSpace: "nowrap" }}>
          DECISION {made}/{total}
        </div>
        <div style={{ display: "flex", flex: 1, gap: 4 }}>
          {allOrder.map((id, i) => (
            <div key={id} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: picks[id] ? C.accent : C.faint,
              transition: "background 0.4s ease",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   OptionCard / DecisionPanel / Ledger
   ============================================================ */

function OptionCard({ option, locked, isPicked, onPick, dimmed, runState }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !locked && onPick(option.id)}
      style={{
        background: isPicked ? C.cardH : C.card,
        border: `1px solid ${isPicked ? C.accent : hover && !locked ? C.accent + "60" : C.border}`,
        borderRadius: 14, padding: "22px 22px 20px",
        cursor: locked ? "default" : "pointer",
        opacity: dimmed ? 0.32 : 1,
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: hover && !locked ? "translateY(-3px)" : "none",
        boxShadow: hover && !locked ? `0 18px 50px ${C.accent}18` : isPicked ? `0 12px 36px ${C.accent}1a` : "none",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", height: "100%",
      }}
    >
      {isPicked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.accent }} />}
      <div style={{
        fontFamily: "var(--mono)", fontSize: 10, color: isPicked ? C.accent : C.muted,
        letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 600,
      }}>{isPicked ? "Locked in" : "Option"}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 8 }}>{option.name}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 15, fontStyle: "italic", color: C.dim, lineHeight: 1.45, marginBottom: 18 }}>{option.tagline}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 }}>
        {option.stats.map((s, i) => (
          <div key={i} style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{s.k}</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 15, color: C.text, fontWeight: 700, marginTop: 3 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <ul style={{ fontFamily: "var(--sans)", fontSize: 13, color: C.dim, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
        {option.bullets.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
      </ul>
      {hover && !locked && !isPicked && runState && (
        <div style={{
          marginTop: 14, padding: "10px 12px",
          background: C.bg, border: `1px dashed ${C.accent}50`, borderRadius: 8,
          fontFamily: "var(--mono)", fontSize: 11, color: C.dim,
          display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
        }}>
          <span style={{ color: C.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: 700 }}>IF YOU PICK THIS</span>
          {option.effects.budget != null && option.effects.budget !== 0 && (
            <span>budget → <strong style={{ color: C.text }}>${Math.round(runState.budget + option.effects.budget).toLocaleString()}M</strong></span>
          )}
          {option.effects.capability != null && option.effects.capability !== 0 && (
            <span>capability → <strong style={{ color: C.accent }}>{Math.min(100, runState.capability + (option.effects.capability || 0))}</strong></span>
          )}
          {option.effects.opex && (
            <span>monthly opex → <strong style={{ color: C.rose }}>+${option.effects.opex}M</strong></span>
          )}
        </div>
      )}
    </div>
  );
}

function DecisionPanel({ decision, picked, onPick, locked, runState }) {
  const cols = decision.options.length;
  return (
    <section id={`d-${decision.id}`} style={{ scrollMarginTop: 90, padding: "70px 0 30px" }}>
      <FadeIn>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.accent, fontWeight: 700, marginBottom: 12 }}>
          {decision.act === "build" ? "BUILD" : "LAUNCH"} · DECISION {decision.chapter}
        </div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 800, color: C.text, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: -0.5 }}>{decision.title}</h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7, color: C.dim, margin: "0 0 36px", maxWidth: 780 }}>{decision.setup}</p>
      </FadeIn>
      <FadeIn delay={0.08}>
        <div className="rpg-options" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {decision.options.map((o) => (
            <OptionCard
              key={o.id}
              option={o}
              locked={locked}
              isPicked={picked === o.id}
              dimmed={locked && picked !== o.id}
              onPick={onPick}
              runState={runState}
            />
          ))}
        </div>
      </FadeIn>
      {picked && <Ledger decision={decision} optionId={picked} />}
    </section>
  );
}

function Ledger({ decision, optionId }) {
  const opt = decision.options.find((o) => o.id === optionId);
  if (!opt) return null;
  const items = ledgerItems(decision, opt);
  return (
    <FadeIn delay={0.15}>
      <div style={{
        marginTop: 24, padding: "18px 22px",
        background: C.glow, border: `1px solid ${C.accent}28`,
        borderRadius: 10, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent, letterSpacing: 1.5, fontWeight: 700, marginRight: 8 }}>LEDGER</div>
        {items.map((it, i) => (
          <Chip key={i} color={it.color} sign={it.sign}>{it.text}</Chip>
        ))}
      </div>
    </FadeIn>
  );
}

function ledgerItems(decision, opt) {
  const e = opt.effects;
  const out = [];
  if (e.budget) out.push({ sign: e.budget < 0 ? "−" : "+", text: `$${Math.abs(e.budget)}M`, color: e.budget < 0 ? C.rose : C.emerald });
  if (e.capability) out.push({ sign: "+", text: `${e.capability} capability`, color: C.accent });
  if (e.trainMonths) out.push({ sign: "·", text: `train ${e.trainMonths} mo`, color: C.dim });
  if (e.lockIn) out.push({ sign: "·", text: `lock-in ${e.lockIn}`, color: C.gold });
  if (e.powerMult) out.push({ sign: "·", text: `power ${Math.round((1 - e.powerMult) * 100)}% lower`, color: C.emerald });
  if (e.safetyDebt && e.safetyDebt > 0) out.push({ sign: "+", text: `safety debt`, color: C.gold });
  if (e.safetyDebt && e.safetyDebt < 0) out.push({ sign: "−", text: `safety debt`, color: C.emerald });
  if (e.opex) out.push({ sign: "+", text: `$${e.opex}M/mo opex`, color: C.rose });
  if (e.infCost) out.push({ sign: "·", text: `$${e.infCost.toFixed(4)}/q`, color: C.accent });
  if (e.featureMult) out.push({ sign: "·", text: `inference ×${e.featureMult}`, color: e.featureMult > 3 ? C.gold : C.dim });
  if (e.pricePerMtok) out.push({ sign: "·", text: `$${e.pricePerMtok}/Mtok`, color: C.emerald });
  return out;
}

/* ============================================================
   Act 1 — Cold open
   ============================================================ */


const ARCHETYPES = [
  {
    id: "hyperscaler_backed",
    name: "The Hyperscaler-Backed",
    realWorld: "Inspired by OpenAI × Microsoft",
    budget: 4000,
    startCap: 45,
    accent: "#60a5fa",
    summary: "Your strategic partner just wired $4B and pre-ordered the GPUs. The board has set a 12-month timeline. They want a frontier model and a press tour.",
    constraints: [
      "Larger budget, but the board strongly prefers NVIDIA-based stacks.",
      "Pressure to ship is real — the partner wants a Q4 launch.",
      "Multi-cloud flexibility is theoretical; you're contractually steered to one cloud.",
    ],
    modifiers: { demandBonus: 1.0, dataDiscount: 1.0, capStart: 5, partnerNVIDIA: true },
  },
  {
    id: "safety_first",
    name: "The Safety-First Lab",
    realWorld: "Inspired by Anthropic",
    budget: 2500,
    startCap: 40,
    accent: "#34d399",
    summary: "$2.5B from mission-aligned investors. Smaller war chest, but five years of alignment research means your RLHF infrastructure is mature, your annotation pipeline is already running, and your safety reputation is a real moat.",
    constraints: [
      "Heavy RLHF data costs are halved — alignment infrastructure already exists.",
      "Capability bonus baked in from the existing safety stack.",
      "Smaller budget than the hyperscaler-backed competition.",
    ],
    modifiers: { demandBonus: 1.0, dataDiscount: 0.5, capStart: 0, safetyBonus: 0.15 },
  },
  {
    id: "open_lab",
    name: "The Open Lab",
    realWorld: "Inspired by Mistral / DeepSeek",
    budget: 1500,
    startCap: 35,
    accent: "#8b5cf6",
    summary: "$1.5B raised. Smallest war chest of the bunch — but a global developer community ready to integrate the day you ship. Your distribution is asymmetric.",
    constraints: [
      "Demand multiplier +25% from community ecosystem.",
      "Lowest budget — every capex decision matters more.",
      "Cultural expectation that you'll open-weight at least the base model.",
    ],
    modifiers: { demandBonus: 1.25, dataDiscount: 1.0, capStart: -5, openExpectation: true },
  },
];


const PIVOTS = [
  {
    id: "ship_v2",
    name: "Ship a v2 update",
    tagline: "Roll a major model update mid-life. Capability +5, costs +$300M.",
    accent: "#60a5fa",
    effects: { capBoost: 5, addCapex: 300 },
    body: "You take the existing model and push an update — better instruction following, fresher knowledge cut-off, lower hallucination rate. The R&D bill is real. The customer perception bump is real.",
  },
  {
    id: "cut_prices",
    name: "Cut prices to defend share",
    tagline: "Drop blended pricing 30%. Demand jumps ~50%. Margin gets tighter.",
    accent: "#f59e0b",
    effects: { priceMult: 0.7, demandMult: 1.5 },
    body: "DeepSeek did it. OpenAI followed. Now it's your turn. Defend market share before a competitor's price action becomes the new floor.",
  },
  {
    id: "acquire",
    name: "Acquire a smaller competitor",
    tagline: "$400M for talent + customer book. Capability +3, demand +20%.",
    accent: "#8b5cf6",
    effects: { addCapex: 400, capBoost: 3, demandMult: 1.2 },
    body: "Pull off an acquihire of a struggling 50-person lab. You inherit their researchers, their fine-tuning recipes, and a respectable enterprise customer book.",
  },
  {
    id: "stay_course",
    name: "Stay the course",
    tagline: "No structural change. Bank the cash. Set up for the next training run.",
    accent: "#34d399",
    effects: {},
    body: "Sometimes the strongest move is to do nothing. Let the model breathe. Compound the cash. The next training run will be better-funded for it.",
  },
];

const PIVOT_MONTH = 9;


function ActArchetypeSelect({ onSelect, shocksOn, onShocksToggle }) {
  const [selected, setSelected] = useState(null);
  const arch = ARCHETYPES.find((a) => a.id === selected);
  return (
    <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", padding: "100px 0 80px" }}>
      <div style={{ width: "100%" }}>
        <FadeIn>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 4, color: C.accent, fontWeight: 700, marginBottom: 18 }}>AETHERIA AI · CHOOSE YOUR LAB</div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="rpg-h1" style={{
            fontFamily: "var(--display)", fontSize: "clamp(40px, 6vw, 68px)",
            fontWeight: 800, lineHeight: 1.05, color: C.text, margin: "0 0 18px", letterSpacing: -1.2,
          }}>Three frontier labs. <br/>Three different starting hands.</h1>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.6, color: C.dim, margin: "0 0 40px", maxWidth: 760, fontStyle: "italic" }}>
            Pick the lab you want to run. Same eight (well, nine) decisions ahead of you — but different budgets, different bonuses, different pressures.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="rpg-options" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
            {ARCHETYPES.map((a) => (
              <ArchetypeCard key={a.id} archetype={a} selected={selected === a.id} onPick={() => setSelected(a.id)} />
            ))}
          </div>
        </FadeIn>
        {arch && (
          <FadeIn>
            <div style={{
              padding: "26px 30px", marginBottom: 20,
              background: C.surface, border: `1px solid ${arch.accent}40`,
              borderLeft: `3px solid ${arch.accent}`,
              borderRadius: 12,
            }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: arch.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>YOU ARE · {arch.name.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.7, color: C.text, marginBottom: 14, maxWidth: 780 }}>{arch.summary}</div>
              <ul style={{ fontFamily: "var(--sans)", fontSize: 14, color: C.dim, lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                {arch.constraints.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
              </ul>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <button onClick={() => onSelect(arch)} style={btnPrimary}>Begin the build →</button>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "10px 14px", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, cursor: "pointer", userSelect: "none",
              }}>
                <input
                  type="checkbox"
                  checked={!!shocksOn}
                  onChange={(e) => onShocksToggle(e.target.checked)}
                  style={{ accentColor: C.accent }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.dim, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
                  Realism mode: black swans
                </span>
              </label>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function ArchetypeCard({ archetype, selected, onPick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onPick}
      style={{
        background: selected ? C.cardH : C.card,
        border: `1px solid ${selected ? archetype.accent : hover ? archetype.accent + "60" : C.border}`,
        borderRadius: 14, padding: "22px 22px 20px", cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? `0 18px 50px ${archetype.accent}25` : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {selected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: archetype.accent }} />}
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: archetype.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
        {selected ? "Locked in" : archetype.realWorld}
      </div>
      <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 14, lineHeight: 1.2 }}>{archetype.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>Budget</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, color: archetype.accent, fontWeight: 800, marginTop: 4 }}>${(archetype.budget/1000).toFixed(1)}B</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>Starting cap</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, color: C.text, fontWeight: 800, marginTop: 4 }}>{archetype.startCap}</div>
        </div>
      </div>
    </div>
  );
}


function ActCold({ onStart, archetype }) {
  return (
    <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", padding: "120px 0 80px" }}>
      <div>
        <FadeIn>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 4, color: C.accent, fontWeight: 700, marginBottom: 18 }}>AN INTERACTIVE BRIEFING · 2026</div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 style={{
            fontFamily: "var(--display)", fontSize: "clamp(40px, 6vw, 76px)",
            fontWeight: 800, lineHeight: 1.05, color: C.text, margin: "0 0 28px", letterSpacing: -1.2,
          }}>
            You have <span style={{ color: C.accent }}>$3 billion</span><br/>
            and <span style={{ color: C.accent2 }}>eighteen months</span>.
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.55, color: C.dim, margin: "0 0 18px", maxWidth: 740, fontStyle: "italic" }}>
            The board has hired you to ship Aetheria's next-generation model. They will not be in this room again until launch.
            Every decision between here and there moves real money — and a lot of it moves before the first user ever types a prompt.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p style={{ fontFamily: "var(--sans)", fontSize: 15, lineHeight: 1.7, color: C.muted, margin: "0 0 50px", maxWidth: 700 }}>
            The point of this exercise isn't to win. It's to see — first-hand and at the right order of magnitude —
            why frontier labs spend the way they do, where the margin actually goes, and what the bill looks like
            after the model is in production.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 40 }}>
            <PrimerCard label="Training cost, frontier model" value="$0.6 – 1.2B" sub="What it now costs to train one." />
            <PrimerCard label="Inference vs training, lifetime" value="2 – 4×" sub="Serving the model costs more than training it." />
            <PrimerCard label="Largest opex line" value="Power" sub="The grid is the binding constraint, not silicon." />
          </div>
        </FadeIn>
        <FadeIn delay={0.5}>
          <button onClick={onStart} style={btnPrimary}>Begin the build →</button>
        </FadeIn>
      </div>
    </section>
  );
}

function PrimerCard({ label, value, sub }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "20px 22px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.accent }} />
      <div style={{ fontFamily: "var(--sans)", fontSize: 10, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 800, color: C.accent, margin: "10px 0 6px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: C.dim, lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
}

const btnPrimary = {
  fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
  background: C.accent, color: "#05070d", border: "none",
  padding: "14px 26px", borderRadius: 8, cursor: "pointer",
  boxShadow: `0 12px 36px ${C.accent}40`,
  transition: "transform .15s ease, box-shadow .15s ease",
};

/* ============================================================
   Act 3 — Training run
   ============================================================ */

function ActTraining({ result, log }) {
  // Build a cumulative spend curve over trainMonths
  const months = result.trainMonths;
  const data = [];
  for (let i = 0; i <= months; i++) {
    const p = i / months;
    const eased = 1 - Math.pow(1 - p, 1.4);
    data.push({ m: `M${i}`, spend: round(result.trainingCost * eased) });
  }
  return (
    <section style={{ padding: "80px 0 40px" }}>
      <FadeIn>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.accent2, fontWeight: 700, marginBottom: 12 }}>INTERLUDE · TRAINING RUN</div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 800, color: C.text, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: -0.5 }}>
          {result.trainMonths} months on the cluster
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7, color: C.dim, margin: "0 0 36px", maxWidth: 780 }}>
          The cluster powers up. For the next {result.trainMonths} months you don't actually do anything — the model trains, the bills arrive, and your job
          is to keep the board calm. Here's what the spend looks like, and what landed in your inbox along the way.
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px 8px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent2, letterSpacing: 1.5, fontWeight: 700 }}>CUMULATIVE TRAINING SPEND</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: C.muted }}>through model checkpoint</div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent2} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={C.accent2} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.faint} strokeDasharray="2 4" />
                <XAxis dataKey="m" stroke={C.muted} tick={{ fontSize: 10, fontFamily: "var(--mono)" }} />
                <YAxis stroke={C.muted} tick={{ fontSize: 10, fontFamily: "var(--mono)" }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<TrainTip />} />
                <Area type="monotone" dataKey="spend" stroke={C.accent2} strokeWidth={2} fill="url(#trainGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={0.15}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent, letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>STATUS LOG</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {log.map((l, i) => (
                <FadeIn key={i} delay={0.05 * i}>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 14 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.accent, fontWeight: 600 }}>D+{l.day}</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: C.dim, lineHeight: 1.55, fontStyle: "italic" }}>{l.text}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.emerald, letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>MODEL SNAPSHOT</div>
            <SnapRow label="Capability" value={`${Math.round(result.capability)} / 100`} color={C.accent} />
            <SnapRow label="Train cost" value={`$${result.trainingCost.toLocaleString()}M`} color={C.rose} />
            <SnapRow label="Train duration" value={`${result.trainMonths} months`} color={C.dim} />
            <SnapRow label="Budget remaining" value={`$${(3000 - result.trainingCost).toLocaleString()}M`} color={(3000 - result.trainingCost) > 600 ? C.emerald : C.gold} />
            <div style={{ marginTop: 18, fontFamily: "var(--serif)", fontSize: 14, color: C.dim, lineHeight: 1.6, fontStyle: "italic", borderLeft: `2px solid ${C.accent}40`, paddingLeft: 14 }}>
              The hard part is now in the rear-view. The expensive part is still ahead.
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function SnapRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, color: color || C.text }}>{value}</div>
    </div>
  );
}

function TrainTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: C.cardH, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", boxShadow: "0 12px 32px rgba(0,0,0,.7)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: C.accent2, fontWeight: 600 }}>${payload[0].value.toLocaleString()}M cumulative</div>
    </div>
  );
}

/* ============================================================
   Act 5 — Live ops
   ============================================================ */


function PivotPanel({ onPick }) {
  const [hovered, setHovered] = useState(null);
  return (
    <FadeIn>
      <div style={{
        background: C.surface, border: `1px solid ${C.gold}`,
        borderRadius: 14, padding: "26px 28px", marginBottom: 24,
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 2, color: C.gold, fontWeight: 700, marginBottom: 10 }}>MID-GAME PIVOT · MONTH 9</div>
        <h3 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1.2, margin: "0 0 10px", letterSpacing: -0.4 }}>The model is in market. What's your next move?</h3>
        <p style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.65, color: C.dim, margin: "0 0 20px", maxWidth: 760 }}>
          You're nine months into live operation. The numbers are in. A competitor just made a move. Pick one strategic response — it'll shape the second half of the run.
        </p>
        <div className="rpg-options" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {PIVOTS.map((p) => (
            <div
              key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onPick(p.id)}
              style={{
                background: C.card,
                border: `1px solid ${hovered === p.id ? p.accent + "70" : C.border}`,
                borderRadius: 12, padding: "16px 18px", cursor: "pointer",
                transition: "all 0.2s ease",
                transform: hovered === p.id ? "translateY(-2px)" : "none",
                boxShadow: hovered === p.id ? `0 14px 32px ${p.accent}1f` : "none",
              }}
            >
              <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", color: p.accent, marginBottom: 8, lineHeight: 1.4 }}>{p.tagline}</div>
              <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: C.dim, lineHeight: 1.55 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}


function ActLiveOps({ result, pivot, onPivotPick }) {
  const [m, setM] = useState(0);
  useEffect(() => {
    if (m >= result.series.length) return;
    if (m === PIVOT_MONTH && !pivot) return; // pause for pivot decision
    const nextMonth = m + 1;
    const hasEvent = result.events.events.some((e) => e.month === nextMonth);
    const delay = hasEvent ? 1500 : 220;
    const t = setTimeout(() => setM((x) => x + 1), delay);
    return () => clearTimeout(t);
  }, [m, result.series.length, result.events.events, pivot]);
  const data = result.series.slice(0, m + 1);
  const triggered = result.events.events.filter((e) => e.month <= m + 1);

  return (
    <section style={{ padding: "80px 0 40px" }}>
      <FadeIn>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.emerald, fontWeight: 700, marginBottom: 12 }}>LIVE OPS · 18 MONTHS</div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 800, color: C.text, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: -0.5 }}>The model is in production</h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7, color: C.dim, margin: "0 0 36px", maxWidth: 780 }}>
          Training was the entrance fee. Inference is the subscription, and now the meter is running.
          Below, eighteen months of revenue and cost unfurl in real time. Watch where the money actually goes.
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px 12px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.emerald, letterSpacing: 1.5, fontWeight: 700 }}>MONTHLY P&L · $M</div>
            <div style={{ display: "flex", gap: 14, fontFamily: "var(--sans)", fontSize: 11, color: C.muted }}>
              <LegendDot c={C.emerald} label="Revenue" />
              <LegendDot c={C.accent} label="Compute" />
              <LegendDot c={C.gold} label="Power" />
              <LegendDot c={C.rose} label="Safety" />
              <LegendDot c={C.accent2} label="Infra" />
              <LegendDot c={C.muted} label="Opex + amort" />
            </div>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid stroke={C.faint} strokeDasharray="2 4" />
                <XAxis dataKey="month" stroke={C.muted} tick={{ fontSize: 10, fontFamily: "var(--mono)" }} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke={C.muted} tick={{ fontSize: 10, fontFamily: "var(--mono)" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<OpsTip />} />
                <Area type="monotone" stackId="cost" dataKey="compute" stroke={C.accent} fill={C.accent + "44"} />
                <Area type="monotone" stackId="cost" dataKey="power" stroke={C.gold} fill={C.gold + "44"} />
                <Area type="monotone" stackId="cost" dataKey="safety" stroke={C.rose} fill={C.rose + "44"} />
                <Area type="monotone" stackId="cost" dataKey="infra" stroke={C.accent2} fill={C.accent2 + "44"} />
                <Area type="monotone" stackId="cost" dataKey="opex" stroke={C.muted} fill={C.muted + "44"} />
                <Area type="monotone" stackId="cost" dataKey="trainAmort" stroke={C.muted} fill={C.muted + "22"} />
                <Line type="monotone" dataKey="revenue" stroke={C.emerald} strokeWidth={2.4} dot={false} />
                <ReferenceLine y={0} stroke={C.muted} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FadeIn>
      {m >= PIVOT_MONTH && !pivot && (
        <PivotPanel onPick={onPivotPick} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {triggered.map((e, i) => (
          <FadeIn key={i}>
            <div style={{
              background: C.card, border: `1px solid ${e.color}40`, borderLeft: `3px solid ${e.color}`,
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: e.color, letterSpacing: 1.5, fontWeight: 700 }}>MONTH {e.month}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, color: C.text }}>{e.title}</div>
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6, color: C.dim }}>{e.text}</div>
              {e.irl && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${C.border}`, fontFamily: "var(--mono)", fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>
                  IRL ↗ {e.irl}
                </div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function LegendDot({ c, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
      {label}
    </span>
  );
}

function OpsTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const ordered = ["revenue", "compute", "power", "safety", "infra", "opex", "trainAmort"];
  const map = {};
  payload.forEach((p) => { map[p.dataKey] = p; });
  return (
    <div style={{ background: C.cardH, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", boxShadow: "0 12px 32px rgba(0,0,0,.7)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.muted, marginBottom: 6 }}>MONTH {label}</div>
      {ordered.map((k) => map[k] ? (
        <div key={k} style={{ fontFamily: "var(--sans)", fontSize: 12, color: map[k].color || C.text, marginTop: 2 }}>
          <span style={{ color: C.muted, textTransform: "capitalize" }}>{k === "trainAmort" ? "amort" : k}: </span>
          <strong>${map[k].value.toFixed(1)}M</strong>
        </div>
      ) : null)}
    </div>
  );
}

/* ============================================================
   Act 6 — Scorecard
   ============================================================ */


function DecisionTree({ result, onReplayFrom }) {
  const order = RETRO_DECISION_IDS;
  const decMap = Object.fromEntries(DECISIONS.map((d) => [d.id, d]));
  return (
    <FadeIn delay={0.28}>
      <div style={{ marginTop: 44 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent2, letterSpacing: 2, fontWeight: 700, margin: "0 0 16px" }}>YOUR PATH THROUGH THE TREE</div>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "20px 18px", overflowX: "auto",
        }}>
          <div style={{ display: "flex", gap: 8, minWidth: order.length * 130 }}>
            {order.map((id, i) => {
              const dec = decMap[id];
              if (!dec) return null;
              const pickedId = result.picks[id];
              return (
                <div key={id} style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")} · {dec.title.toLowerCase().split(",")[0]}
                  </div>
                  {dec.options.map((opt) => {
                    const active = opt.id === pickedId;
                    return (
                      <div key={opt.id}
                        onClick={active && onReplayFrom ? () => onReplayFrom(id) : undefined}
                        style={{
                          padding: "8px 10px", marginBottom: 4,
                          background: active ? C.glow : "transparent",
                          border: `1px solid ${active ? C.accent : C.border}`,
                          borderRadius: 6,
                          fontFamily: "var(--sans)", fontSize: 11, lineHeight: 1.3,
                          color: active ? C.text : C.muted,
                          fontWeight: active ? 700 : 400,
                          cursor: active && onReplayFrom ? "pointer" : "default",
                          transition: "all 0.15s ease",
                          opacity: active ? 1 : 0.5,
                      }}>
                        {opt.name.split("·")[0].trim()}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: C.muted, marginTop: 10, fontStyle: "italic" }}>Click any of your highlighted picks to replay from that decision.</div>
      </div>
    </FadeIn>
  );
}


function ActScorecard({ result, onReplay, onReplayFrom }) {
  const lastCum = result.series[result.series.length - 1].cumProfit;
  const grade = gradeRun(result);
  const summary = buildSummary(result);
  const retros = buildRetrospective(result);
  const replay = buildReplaySuggestion(result);

  return (
    <section style={{ padding: "100px 0 120px", borderTop: `1px solid ${C.border}`, marginTop: 60 }}>
      <FadeIn>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.gold, fontWeight: 700, marginBottom: 14 }}>SCORECARD · MONTH 18</div>
        <h2 style={{
          fontFamily: "var(--display)", fontSize: "clamp(40px, 5.5vw, 60px)",
          fontWeight: 800, color: C.text, lineHeight: 1.05,
          margin: "0 0 18px", letterSpacing: -0.8,
        }}>{grade.headline}</h2>
        <p style={{
          fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.6,
          color: C.dim, margin: "0 0 36px", maxWidth: 800, fontStyle: "italic",
        }}>{grade.tagline}</p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: "24px 28px", marginBottom: 40,
          borderLeft: `3px solid ${grade.color}`,
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: grade.color, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>YOUR RUN, IN ONE PARAGRAPH</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.7, color: C.text }}>{summary}</div>
        </div>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent, letterSpacing: 2, fontWeight: 700, margin: "32px 0 16px" }}>EVERY DECISION YOU MADE, REVIEWED</div>
      </FadeIn>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {retros.map((r, i) => (
          <FadeIn key={i} delay={Math.min(0.06 * i, 0.4)}>
            <RetroCard retro={r} index={i + 1} decisionId={RETRO_DECISION_IDS[i]} onReplayFrom={onReplayFrom} />
          </FadeIn>
        ))}
      </div>

      <DecisionTree result={result} onReplayFrom={onReplayFrom} />

      <FadeIn delay={0.32}>
        <div style={{
          marginTop: 44, padding: "26px 28px",
          background: C.glow, border: `1px solid ${C.accent}40`,
          borderRadius: 14,
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>IF YOU RAN IT BACK</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>{replay.headline}</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.7, color: C.dim }}>{replay.body}</div>
        </div>
      </FadeIn>

      <FadeIn delay={0.25}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 36 }}>
          <button onClick={onReplay} style={btnPrimary}>Run it back →</button>
        </div>
      </FadeIn>
    </section>
  );
}

function RetroCard({ retro, index, onReplayFrom, decisionId }) {
  const verdictColors = {
    positive: C.emerald,
    mixed: C.gold,
    negative: C.rose,
  };
  const verdictLabels = {
    positive: "WORKED",
    mixed: "MIXED",
    negative: "BACKFIRED",
  };
  const col = verdictColors[retro.verdict];
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${col}`,
      borderRadius: 12, padding: "20px 24px",
      display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 20, alignItems: "start",
    }}>
      <div style={{
        fontFamily: "var(--display)", fontSize: 22, fontWeight: 800,
        color: C.muted, lineHeight: 1, paddingTop: 4,
      }}>{String(index).padStart(2, "0")}</div>
      <div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: C.muted,
          letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, fontWeight: 600,
        }}>{retro.title}</div>
        <div style={{
          fontFamily: "var(--display)", fontSize: 19, fontWeight: 700,
          color: C.text, lineHeight: 1.3, marginBottom: 4,
        }}>{retro.pickName}</div>
        <div style={{
          fontFamily: "var(--display)", fontSize: 16, fontWeight: 600,
          color: col, lineHeight: 1.4, marginBottom: 8,
        }}>{retro.headline}</div>
        <div style={{
          fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.65,
          color: C.dim, marginBottom: 8,
        }}>{retro.detail}</div>
        {retro.unintended && (
          <div style={{
            fontFamily: "var(--sans)", fontSize: 13, lineHeight: 1.55,
            color: C.muted, fontStyle: "italic",
            paddingLeft: 12, borderLeft: `2px solid ${C.border}`,
            marginTop: 10,
          }}>
            <span style={{ color: C.muted, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", marginRight: 8 }}>Second-order</span>
            {retro.unintended}
          </div>
        )}
      </div>
      <div className="rpg-retro-verdict" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginTop: 6 }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: col,
          letterSpacing: 1.5, fontWeight: 700, padding: "4px 10px",
          background: col + "1a", borderRadius: 999, whiteSpace: "nowrap",
        }}>{verdictLabels[retro.verdict]}</div>
        {onReplayFrom && decisionId && (
          <button
            onClick={() => onReplayFrom(decisionId)}
            style={{
              fontFamily: "var(--mono)", fontSize: 9, color: C.dim,
              background: "transparent", border: `1px solid ${C.border}`,
              padding: "4px 9px", borderRadius: 999, cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >Replay from here ↻</button>
        )}
      </div>
    </div>
  );
}

function gradeRun(r) {
  if (r.infWallTriggered && r.grossMargin < -0.5) return { headline: "You hit the wall.", tagline: "Inference economics ran ahead of you. The lessons cost about $2 billion to learn.", color: C.red };
  if (r.grossMargin < -0.1) return { headline: "Cash bonfire.", tagline: "Real product, real users, no path to profitability without major surgery. Plenty of company on this side of the line in 2026.", color: C.red };
  if (r.grossMargin > 0.55 && r.grossProfit > 4500) return { headline: "A frontier lab that prints money.", tagline: "Real capability, durable margin, plenty of cash. The board approves the next training run before lunch.", color: C.emerald };
  if (r.grossMargin > 0.45) return { headline: "Margin king.", tagline: "You ran a tight ship and the numbers reflect it. Smaller absolute footprint than the headline labs, but the profit-per-employee chart looks great.", color: C.emerald };
  if (r.grossMargin > 0.25 && r.grossProfit > 3000) return { headline: "A real business with room to compound.", tagline: "Solid model, profitable serving, capital to spare. You spend the next quarter explaining why you don't need to raise.", color: C.emerald };
  if (r.grossMargin > 0.05) return { headline: "Survived.", tagline: "You ended in the black on a fully-loaded basis. The next run will need to be sharper to compound this into something real.", color: C.gold };
  return { headline: "Burn-rate frontier lab.", tagline: "You shipped a real model and put it in front of real users. The bill caught up to you. The fundraise will be… vibrant.", color: C.gold };
}

function buildSummary(r) {
  const opt = (id, decId) => {
    const dec = DECISIONS.find((d) => d.id === decId);
    return dec ? (dec.options.find((o) => o.id === id) || {}).name : "";
  };
  const compName = opt(r.picks.compute, "compute") || "";
  const archName = (opt(r.picks.architecture, "architecture") || "").toLowerCase().includes("mixture") ? "MoE" : "dense";
  const prodName = ({ chat_only: "chat-only", chat_agentic: "agentic", chat_agentic_video: "agentic + video" })[r.picks.product] || "chat";
  const priceName = ({ freemium: "freemium", premium_api: "premium API", enterprise: "enterprise" })[r.picks.pricing] || "premium";
  const cap = Math.round(r.capability);
  const rev = Math.round(r.totalRevenue / 100) / 10;
  const cost = Math.round(r.totalCost / 100) / 10;
  const profit = Math.round((r.totalRevenue - r.totalCost) / 100) / 10;
  const margin = Math.round(r.grossMargin * 100);

  let punchline;
  if (r.moeOnTPU) {
    punchline = "Vertical integration delivered: the MoE-on-TPU pairing was the cheapest way to serve a frontier model in 2026, and the numbers showed it.";
  } else if (r.veraEligible && r.grossMargin > 0) {
    punchline = "Vera + Blackwell + agentic was the only NVIDIA combo that competed with Google on serving cost. You found it.";
  } else if (r.crossVendorFlag) {
    punchline = "Cross-vendor inference is a tax on indecision. The $250M port and the inference markup ate most of what the silicon flexibility was supposed to buy you.";
  } else if (r.grossMargin > 0.4 && r.picks.product === "chat_only") {
    punchline = "Chat-only is the highest-margin product surface in AI. You traded headlines for a P&L the board can read.";
  } else if (r.infWallTriggered) {
    punchline = "You hit the Inference Wall — for the first time in living memory, more capital is being spent serving frontier models than training them.";
  } else if (r.picks.product === "chat_agentic_video" && r.grossMargin < 0) {
    punchline = "Video at scale is a margin grenade unless your serving cost is below $3/Mtok. You did not have that.";
  } else if (r.picks.pricing === "freemium" && r.grossMargin < 0) {
    punchline = "Freemium economics only work when the cost of goods is genuinely tiny. Yours wasn't.";
  } else {
    punchline = "Most of the dollars in this run went to inference, not training — which is the actual story of frontier AI in 2026.";
  }

  return `You shipped a ${cap}/100-capability ${archName} model on a ${compName.split("·")[0].trim()} stack, served as a ${prodName} product on ${priceName} pricing. Over 18 months, $${rev}B of revenue against $${cost}B of cost — a ${margin}% gross margin and ${profit >= 0 ? "+" : "−"}$${Math.abs(profit)}B on the bottom line. ${punchline}`;
}

function buildReplaySuggestion(r) {
  // Identify the single most-improvable lever and propose a swap.
  if (r.infWallTriggered) {
    return {
      headline: "Cap the product surface before the silicon.",
      body: "Your inference cost ran ahead of revenue. On a re-run, drop video (or agentic) until you've proven the unit economics on chat. Or move to a stack with a lower $/Mtok floor — TPU v8t + MoE is the single biggest lever.",
    };
  }
  if (r.crossVendorFlag) {
    return {
      headline: "Pick one stack and live with it.",
      body: "Cross-vendor inference cost you a $250M port and ~60% on every query for the first quarter. On a re-run: either commit to the Google stack end-to-end (TPU train + TPU v8i serve) or NVIDIA end-to-end (Rubin + Blackwell). The savings are real.",
    };
  }
  if (r.picks.compute === "google_tpu" && r.picks.architecture === "dense") {
    return {
      headline: "If you're on TPU, ship MoE.",
      body: "Dense on TPU is the worst of both worlds — you took the lock-in without claiming the architectural discount. Mixture-of-Experts on TPU v8t lowers serving cost ~25% and trains faster.",
    };
  }
  if (r.picks.compute === "nvidia_rubin" && r.picks.product === "chat_only") {
    return {
      headline: "NVIDIA is best when you're shipping multi-step workloads.",
      body: "You bought the most flexible silicon stack in the industry and shipped a chat-only product. On a re-run, either move to TPU (cheaper for chat at scale) or keep NVIDIA and ship agentic — Vera CPUs make multi-step queries cost-competitive.",
    };
  }
  if (r.picks.data === "minimal_rlhf") {
    return {
      headline: "Pay the RLHF bill upfront.",
      body: "Skipping RLHF saved $240M on the training capex. Your safety and moderation costs in production cost more than that. The shortcut had a tail. On a re-run, take the heavy RLHF line.",
    };
  }
  if (r.picks.datacenter === "dedicated_smr") {
    return {
      headline: "SMR is a 5-year bet, not an 18-month one.",
      body: "Dedicated power saves real money over a long horizon — but the $520M and the 2-month delay didn't pay back in 18 months. On a tight time window, hyperscaler co-lo on grid power is the more honest call.",
    };
  }
  return {
    headline: "Push the product surface to the next tier.",
    body: "Your unit economics held. The next run, you can afford to either ship agentic (where Vera + Blackwell is competitive) or move to a freemium tier and trade margin for top-of-funnel. The cost structure supports it.",
  };
}

function buildRetrospective(r) {
  const opts = {
    compute: pick(r.picks.compute, DECISIONS, "compute"),
    datacenter: pick(r.picks.datacenter, DECISIONS, "datacenter"),
    architecture: pick(r.picks.architecture, DECISIONS, "architecture"),
    data: pick(r.picks.data, DECISIONS, "data"),
    talent: pick(r.picks.talent, DECISIONS, "talent"),
    inference: pick(r.picks.inference, DECISIONS, "inference"),
    product: pick(r.picks.product, DECISIONS, "product"),
    openness: pick(r.picks.openness, DECISIONS, "openness"),
    pricing: pick(r.picks.pricing, DECISIONS, "pricing"),
  };
  const out = [];

  out.push(evalCompute(r, opts));
  out.push(evalDatacenter(r, opts));
  out.push(evalArchitecture(r, opts));
  out.push(evalData(r, opts));
  out.push(evalTalent(r, opts));
  out.push(evalInference(r, opts));
  out.push(evalProduct(r, opts));
  out.push(evalOpenness(r, opts));
  out.push(evalPricing(r, opts));
  return out;
}

function evalCompute(r, opts) {
  const o = opts.compute;
  const base = { title: "Compute vendor", pickName: o.name };
  if (r.picks.compute === "google_tpu") {
    if (r.moeOnTPU) {
      return { ...base, verdict: "positive",
        headline: "Vertical integration paid off.",
        detail: `TPU + MoE was the cheapest serving stack money could buy in 2026. Your $/Mtok served (${r.infCostPerMtok.toFixed(2)}) is roughly half what the same model on NVIDIA would have produced.`,
        unintended: "Lock-in is now real. A future strategy that requires NVIDIA hardware is a 6-month rewrite — Google priced the savings knowing this." };
    }
    return { ...base, verdict: "negative",
      headline: "TPU silicon, dense architecture: half the gain.",
      detail: "TPU v8t was co-designed with Mixture-of-Experts. By picking dense, you paid for Google's serving advantage but couldn't claim the architectural discount.",
      unintended: "Dense models on TPU are roughly equivalent to NVIDIA on cost. You took on the lock-in without the savings that justify it." };
  }
  if (r.picks.compute === "nvidia_rubin") {
    if (r.veraEligible) {
      return { ...base, verdict: "positive",
        headline: "Best chip for what you shipped.",
        detail: `Vera + Blackwell + agentic = the only setup where multi-step queries run at half the compute of a generic stack. Your $/Mtok came in at $${r.infCostPerMtok.toFixed(2)} — cost-competitive with TPU at this product surface.`,
        unintended: "You're paying NVIDIA's 75% gross margin on every chip. Their P&L thanks you." };
    }
    if (r.picks.product === "chat_only") {
      return { ...base, verdict: "mixed",
        headline: "Best chip, simplest product.",
        detail: "NVIDIA's edge is research velocity and agentic workloads. Chat-only doesn't exercise either. The optionality you bought went mostly unused.",
        unintended: "Your $/Mtok floor is structurally above a TPU stack. For chat-only at scale, that's pure margin you didn't need to give up." };
    }
    return { ...base, verdict: "mixed",
      headline: "Research velocity, at the going rate.",
      detail: `CUDA-trained researchers ship roughly 5% faster — your demand baseline reflects that. Serving cost ($${r.infCostPerMtok.toFixed(2)}/Mtok) is the price of the velocity.`,
      unintended: "Multi-cloud portability is real but unused this run. The premium you paid is for an option you didn't exercise." };
  }
  // hybrid
  return { ...base, verdict: "mixed",
    headline: "Optionality wasn't free.",
    detail: "Two stacks to staff, two contracts to negotiate. You preserved the right to switch vendors and paid roughly $140M for the privilege.",
    unintended: "Hybrid only pays back if a year-2 pivot makes you switch stacks. If not, you simply spent more this run." };
}

function evalDatacenter(r, opts) {
  const o = opts.datacenter;
  const base = { title: "Datacenter & power", pickName: o.name };
  const id = r.picks.datacenter;
  if (id === "dedicated_smr") {
    if (r.grossMargin > 0.4) {
      return { ...base, verdict: "mixed",
        headline: "Power moat — over a longer horizon.",
        detail: `SMR cut your power bill ~35% (a real ${Math.round(r.breakdown.power * 0.35 / r.breakdown.power * 100)}% line item). Over 5+ years, this is a moat.`,
        unintended: `Two months of training delay cost ~10% of revenue ramp ($${Math.round(r.totalRevenue * 0.1 / 100) / 10}B). On an 18-month horizon, the SMR doesn't quite pay back.` };
    }
    return { ...base, verdict: "negative",
      headline: "Right bet, wrong horizon.",
      detail: "$520M of capex and 2 months of delay buys you 35% off power forever — a great deal over 5 years.",
      unintended: "Inside an 18-month window, the lost ramp time and the upfront capex outweigh the savings. SMR is a long-game decision." };
  }
  if (id === "hyperscaler_grid") {
    return { ...base, verdict: "mixed",
      headline: "Fast to power, exposed to spot prices.",
      detail: "You launched on time. Power costs moved with the grid for the life of the model.",
      unintended: "When the grid tightens — and it tightened twice in this run — your inference cost moves with it. You're a price-taker on power." };
  }
  return { ...base, verdict: "mixed",
    headline: "Distributed: hedged but slower.",
    detail: "Three regions reduced single-grid exposure and saved 15% on blended power. Networking overhead reduced effective throughput by ~5%.",
    unintended: "When the Texas region's transformer slipped three weeks, the other two absorbed the load. The hedge worked exactly once." };
}

function evalArchitecture(r, opts) {
  const o = opts.architecture;
  const base = { title: "Architecture", pickName: o.name };
  const id = r.picks.architecture;
  if (id === "moe") {
    if (r.moeOnTPU) {
      return { ...base, verdict: "positive",
        headline: "Co-designed with the silicon.",
        detail: "MoE on TPU v8t trained ~10% faster than dense and lowered serving cost ~25%. The architecture and the chip were built to be paired.",
        unintended: "Debugging a misrouting expert is harder than debugging a dense model — your eval team felt this in month 9." };
    }
    return { ...base, verdict: "mixed",
      headline: "MoE without the matching silicon.",
      detail: "MoE is harder to debug and serves at roughly the same cost as dense on NVIDIA hardware.",
      unintended: "You took on architectural complexity without the serving advantage. Worth it if you plan to redeploy on TPU later." };
  }
  if (r.picks.compute === "google_tpu") {
    return { ...base, verdict: "negative",
      headline: "Dense on TPU: paid for the lock-in, didn't claim the discount.",
      detail: "TPU's structural cost advantage on serving is concentrated in MoE. Dense models don't realize most of it.",
      unintended: "If you'd picked NVIDIA + dense, you'd have spent the same on capex and gotten more research velocity." };
  }
  return { ...base, verdict: "positive",
    headline: "Dense + NVIDIA: the boring, working combination.",
    detail: "Predictable training, well-understood debugging, easy fine-tuning. The default for a reason.",
    unintended: "Inference cost scales linearly with parameters — there's no escaping the bill. You knew that going in." };
}

function evalData(r, opts) {
  const o = opts.data;
  const base = { title: "Data & RLHF", pickName: o.name };
  if (r.picks.data === "minimal_rlhf") {
    const safetySpend = Math.round(r.breakdown.safety);
    return { ...base, verdict: "negative",
      headline: "RLHF you skip is moderation you pay for.",
      detail: `You saved $240M on annotation. You spent $${safetySpend}M on moderation, contractors, and legal review across 18 months.`,
      unintended: "Every news cycle about your model saying something it shouldn't became a P&L line. The shortcut had a tail." };
  }
  if (r.picks.data === "heavy_rlhf") {
    return { ...base, verdict: "positive",
      headline: "Data quality compounded quietly.",
      detail: "Heavy RLHF was your largest training-line item. It bought you 18 capability points and the cheapest moderation costs of any path.",
      unintended: "Three-year publisher licensing deals are committed cash. If your strategy changes, those obligations don't." };
  }
  return { ...base, verdict: "mixed",
    headline: "Synthetic data: cheap, controllable, narrow.",
    detail: "$170M cheaper than full RLHF. Model is strong on code and math.",
    unintended: "Distribution drift on the messier parts of human writing. Ratings on creative tasks lag the heavy-RLHF cohort by a clear margin." };
}

function evalTalent(r, opts) {
  const o = opts.talent;
  const base = { title: "Talent shape", pickName: o.name };
  if (r.picks.talent === "big_inhouse") {
    if (r.grossProfit > 4000) {
      return { ...base, verdict: "positive",
        headline: "The bench paid for itself.",
        detail: "$22M/month in research compensation, sustained for 18 months. Throughput compounded — three model updates shipped during live ops.",
        unintended: "Coordination overhead grew superlinearly. The 41st researcher slowed the rest of the team by a measurable amount." };
    }
    return { ...base, verdict: "mixed",
      headline: "Heavy bench, lean revenue.",
      detail: "$22M/month sustained. The throughput was real but the topline didn't grow fast enough to absorb it cleanly.",
      unintended: "Most labs that started 2026 with a 40-researcher org spent year two trimming. You may end up there too." };
  }
  if (r.picks.talent === "lean_academic") {
    return { ...base, verdict: "positive",
      headline: "Lean operator, low burn.",
      detail: "$8M/month sustained. You shipped one strong model and didn't spend a fortune doing it.",
      unintended: "If your big bet hadn't worked, there was no obvious backup plan. It worked." };
  }
  return { ...base, verdict: "mixed",
    headline: "Bought a roadmap.",
    detail: "Day-one productivity from the acquihired team. Inherited a working pipeline.",
    unintended: "Two of the founders left inside 18 months. You expected this; it still hurt." };
}

function evalInference(r, opts) {
  const o = opts.inference;
  const base = { title: "Inference hardware", pickName: o.name };
  if (r.crossVendorFlag) {
    return { ...base, verdict: "negative",
      headline: "Cross-vendor: a tax on indecision.",
      detail: "Re-distilling from one stack to the other cost an extra $250M and bumped your inference cost ~60% for the first quarter.",
      unintended: "The rationale for switching vendors mid-stack rarely justifies the port cost. Pick one stack early." };
  }
  if (r.picks.inference === "tpu_v8i" && r.picks.compute === "google_tpu") {
    return { ...base, verdict: "positive",
      headline: "End-to-end Google: the lowest serving floor available.",
      detail: `TPU v8i ran your serving at ~$2/Mtok base. The deployment was a config change, not a port.`,
      unintended: "Migrating off Google later means rewriting the inference stack. The lock-in is real, just deferred." };
  }
  if (r.picks.inference === "nvidia_blackwell" && r.veraEligible) {
    return { ...base, verdict: "positive",
      headline: "Vera + Blackwell: NVIDIA's only winning lane.",
      detail: "Tool-calling agentic queries ran at half the compute of a generic stack. The 0.5× multiplier is what made NVIDIA economics work.",
      unintended: "If you ever ship video, the Vera advantage doesn't apply. The optimization is narrow but deep." };
  }
  if (r.picks.inference === "nvidia_blackwell") {
    return { ...base, verdict: "mixed",
      headline: "Universal-fit silicon, off-peak product.",
      detail: "Blackwell is great hardware. You didn't ship the workload it's optimized for.",
      unintended: "On chat-only or video, your serving cost was higher than necessary. Right tool, wrong job." };
  }
  return { ...base, verdict: "negative",
    headline: "Reused training silicon: saved capex, paid in COGS.",
    detail: "Training chips are tuned for matmul throughput, not low-latency serving. Inference cost landed ~2× higher than a dedicated stack would have produced.",
    unintended: "Saved $180M of capex you didn't have anyway. Paid more than that back in 18 months of inflated serving cost." };
}


function evalOpenness(r, opts) {
  const o = opts.openness;
  const base = { title: "Open weights or closed", pickName: o.name };
  if (r.openWeights) {
    if (r.grossMargin > 0.3) {
      return { ...base, verdict: "positive",
        headline: "Open weights, profitable margin.",
        detail: "You took a 40% revenue cut on price and got 50% more demand from the developer ecosystem. The math worked because your serving cost was low enough to absorb it.",
        unintended: "Top researchers want to publish. Your hiring funnel just got materially better." };
    }
    return { ...base, verdict: "mixed",
      headline: "Open weights bought brand, cost margin.",
      detail: "Demand jumped 50% from the community ecosystem. Blended price dropped 40% as some users self-host. The net was a brand and recruiting win, but the P&L tightened.",
      unintended: "Open-weighting is hard to reverse. Your year-2 strategic options are constrained — closed-weight again would be received as a betrayal." };
  }
  return { ...base, verdict: "mixed",
    headline: "Closed weights: full revenue capture, less brand.",
    detail: "Standard frontier-lab playbook. Every query goes through your infra; you see the data; you set the price.",
    unintended: "Recruiting top researchers is structurally harder when you don't publish. The best of them want their work out in the world." };
}


function evalProduct(r, opts) {
  const o = opts.product;
  const base = { title: "Product surface", pickName: o.name };
  if (r.picks.product === "chat_only") {
    return { ...base, verdict: r.grossMargin > 0.4 ? "positive" : "mixed",
      headline: "Highest-margin product surface in AI.",
      detail: "One response per query. Predictable cost, predictable revenue. Hardest to differentiate from competitors.",
      unintended: "You gave up the headlines. You kept the margin. There's a reason every profitable AI company started here." };
  }
  if (r.picks.product === "chat_agentic") {
    if (r.veraEligible) {
      return { ...base, verdict: "positive",
        headline: "Agentic on the right silicon.",
        detail: "Each user request triggered tool calls and retries. Vera + Blackwell ran them at half the compute. Sticky product, viable margin.",
        unintended: "If you'd been on a non-Vera stack, the same product would have been a margin grenade." };
    }
    return { ...base, verdict: "mixed",
      headline: "Agentic without Vera: the multiplier is real.",
      detail: "Tool calls and retries averaged 2.5× the compute of a chat query. Power and infra moved together with usage.",
      unintended: "Your monthly P&L looks nothing like your forecast. Power became your largest line." };
  }
  // video
  if (r.moeOnTPU) {
    return { ...base, verdict: "mixed",
      headline: "Video, on the only stack that can serve it.",
      detail: "Even on TPU + MoE, video is expensive. The headlines arrived. So did the bills.",
      unintended: "Your revenue ceiling lifted, but the unit economics on video traffic are tight. Worth it if you can monetize the brand halo." };
  }
  return { ...base, verdict: "negative",
    headline: "Video on the wrong stack.",
    detail: "Each one-minute video query cost ~1,000× a chat query. Your serving cost on video alone was structurally above any plausible price.",
    unintended: "Companies that shipped video in 2026 without a Google-class serving floor had margin profiles that made operating at scale impossible." };
}

function evalPricing(r, opts) {
  const o = opts.pricing;
  const base = { title: "Pricing", pickName: o.name };
  if (r.picks.pricing === "freemium") {
    if (r.grossMargin > 0.2) {
      return { ...base, verdict: "positive",
        headline: "Freemium worked because your COGS was tiny.",
        detail: "Free-tier users send 4× the queries paid users do. You could absorb that because your $/Mtok floor was low enough to stay above water.",
        unintended: "Your top-of-funnel is now massive. Brand recognition is a moat for the next training run." };
    }
    return { ...base, verdict: "negative",
      headline: "Freemium without low-cost serving is a subsidy program.",
      detail: "You paid more to serve the average free-tier user than they generated. Adoption was real; the unit economics weren't.",
      unintended: "Pulling back to a paywall after a freemium launch is brand-destructive. The next run starts from a worse place." };
  }
  if (r.picks.pricing === "premium_api") {
    return { ...base, verdict: "positive",
      headline: "Standard frontier pricing.",
      detail: "$8/Mtok blended. Every query was gross-margin positive on day one. Adoption real, growth steady.",
      unintended: "You're not a household name in year one. Brand recognition will need to be earned with the next model." };
  }
  return { ...base, verdict: r.grossMargin > 0.4 ? "positive" : "mixed",
    headline: "Enterprise: slow, then fast.",
    detail: "$20/Mtok blended on Fortune-500 contracts. The only path that produces a profitable quarter inside year one.",
    unintended: "Three-quarter sales cycles. Your top-of-funnel is invisible. The model has no consumer brand." };
}

/* ============================================================
   Reckoning — Act 5.5: where the dollars actually went
   ============================================================ */


const REAL_LABS = [
  { name: "Google DeepMind", $perMtok: 3.0, capex: 600, margin: 0.62, color: "#4285f4" },
  { name: "OpenAI", $perMtok: 8.0, capex: 1100, margin: 0.40, color: "#10a37f" },
  { name: "Anthropic", $perMtok: 10.0, capex: 800, margin: 0.45, color: "#d97757" },
  { name: "Mistral", $perMtok: 4.0, capex: 200, margin: 0.30, color: "#fa520f" },
];

function BenchmarkPanel({ result }) {
  const yours = {
    name: "Your run",
    perMtok: result.infCostPerMtok,
    capex: result.trainingCost,
    margin: result.grossMargin,
    color: C.accent,
  };
  // Three rows, each comparing one metric
  const rows = [
    { label: "$ / Mtok served", key: "perMtok", format: (v) => `$${v.toFixed(2)}`, lower: true },
    { label: "Training capex ($M)", key: "capex", format: (v) => `$${Math.round(v)}M`, lower: true },
    { label: "Gross margin", key: "margin", format: (v) => `${(v*100).toFixed(0)}%`, lower: false },
  ];
  return (
    <FadeIn delay={0.25}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: "22px 26px", marginTop: 28, marginBottom: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent, letterSpacing: 1.5, fontWeight: 700 }}>YOUR RUN VS THE REAL LABS</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: C.muted, fontStyle: "italic" }}>order-of-magnitude only · figures are public estimates</div>
        </div>
        {rows.map((row) => {
          const allValues = [yours, ...REAL_LABS].map((lab) => ({
            name: lab.name,
            value: row.key === "perMtok" ? (lab.perMtok ?? lab["$perMtok"]) : lab[row.key],
            color: lab.color,
            isYou: lab.name === "Your run",
          }));
          const maxV = Math.max(...allValues.map((x) => x.value));
          return (
            <div key={row.key} style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: C.muted, letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>{row.label}</div>
              {allValues.map((v) => (
                <div key={v.name} className="rpg-bridge-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr 96px", gap: 12, alignItems: "center", padding: "5px 0" }}>
                  <div style={{ fontFamily: v.isYou ? "var(--display)" : "var(--sans)", fontWeight: v.isYou ? 700 : 500, fontSize: 13, color: v.isYou ? v.color : C.dim }}>
                    {v.name}{v.isYou ? " ←" : ""}
                  </div>
                  <div style={{ height: 8, background: C.faint, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${(v.value / maxV) * 100}%`, background: v.color,
                      opacity: v.isYou ? 1 : 0.7, transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
                    }} />
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 700, color: v.isYou ? v.color : C.dim, textAlign: "right" }}>
                    {row.format(v.value)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}


function ActReckoning({ result, calibration }) {
  const b = result.breakdown;
  const profit = b.revenue - b.compute - b.power - b.safety - b.infra - b.training - b.opex;
  const ratio = b.training > 0 ? (b.compute + b.power + b.safety + b.infra) / b.training : 0;
  const items = [
    { label: "Revenue",            value: b.revenue,  color: C.emerald, kind: "in" },
    { label: "Training (amortized)",value: b.training, color: C.muted,   kind: "out" },
    { label: "Inference compute",   value: b.compute,  color: C.accent,  kind: "out" },
    { label: "Power",               value: b.power,    color: C.gold,    kind: "out" },
    { label: "Safety & moderation", value: b.safety,   color: C.rose,    kind: "out" },
    { label: "Infrastructure",      value: b.infra,    color: C.accent2, kind: "out" },
    { label: "Talent + admin",      value: b.opex,     color: C.muted,   kind: "out" },
  ];
  const maxBar = Math.max(b.revenue, b.compute + b.power + b.safety + b.infra + b.training + b.opex);
  const phases = result.phases;

  return (
    <section style={{ padding: "80px 0 40px" }}>
      {calibration && <CalibrationReveal guess={calibration} actual={result.infCostPerMtok} />}
      <FadeIn>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.gold, fontWeight: 700, marginBottom: 12 }}>RECKONING · 18-MONTH P&L</div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 800, color: C.text, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: -0.5 }}>
          Where the dollars actually went
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7, color: C.dim, margin: "0 0 36px", maxWidth: 820 }}>
          The most useful chart in AI economics isn't the one with the model name on top of a benchmark. It's this one — every dollar that came in, every dollar that went out, in the right order of magnitude.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 26px", marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.gold, letterSpacing: 1.5, fontWeight: 700, marginBottom: 18 }}>THE BRIDGE · 18 MONTHS, $M</div>
          {items.map((it, i) => (
            <BridgeRow key={i} label={it.label} value={it.value} color={it.color} kind={it.kind} max={maxBar} />
          ))}
          <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
          <BridgeRow
            label={profit >= 0 ? "Gross profit" : "Gross loss"}
            value={Math.abs(profit)}
            color={profit >= 0 ? C.emerald : C.red}
            kind="result"
            max={maxBar}
            sign={profit >= 0 ? "+" : "−"}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <RatioCard
            label="Inference vs training"
            value={`${ratio.toFixed(1)}×`}
            color={C.accent}
            sub={ratio > 2 ? "Serving the model cost more than 2× what it cost to train it. This is the AI economics story of 2026." : ratio > 1 ? "Serving and training landed roughly even. Most labs land here in year one and then inference runs ahead." : "Training still dominated lifetime cost — you served at unusually low volume or unusually low cost-per-query."}
          />
          <RatioCard
            label="Gross margin"
            value={`${(result.grossMargin * 100).toFixed(0)}%`}
            color={result.grossMargin > 0.3 ? C.emerald : result.grossMargin > 0 ? C.gold : C.red}
            sub={result.grossMargin > 0.5 ? "Top-decile margin for a frontier lab. Mostly only achievable on chat-only or enterprise pricing." : result.grossMargin > 0.25 ? "Healthy frontier-lab margin. You can absorb a price war and still be profitable." : result.grossMargin > 0 ? "Slim. The next pricing move from a competitor probably tips this negative." : "Loss-making at the gross level. Cost structure has to change before scale helps."}
          />
        </div>
      </FadeIn>

      <BenchmarkPanel result={result} />

      <FadeIn delay={0.18}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent, letterSpacing: 2, fontWeight: 700, margin: "32px 0 14px" }}>WHY YOUR REVENUE GREW THIS WAY</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <PhaseCard
            tag="MONTHS 1–4"
            tagColor={C.muted}
            title="Cold start"
            stat={`$${Math.round(phases.early.revenue/100)/10}B`}
            share={`${Math.round(phases.early.share*100)}% of revenue`}
            text="Most users haven't heard of you yet. Integrations are still being written. You're earning attention, not dollars."
          />
          <PhaseCard
            tag="MONTHS 5–9"
            tagColor={C.accent}
            title="Inflection"
            stat={`$${Math.round(phases.mid.revenue/100)/10}B`}
            share={`${Math.round(phases.mid.share*100)}% of revenue`}
            text={`Capability hits a useful threshold. Word-of-mouth and developer integrations carry you. ${result.picks.pricing === "freemium" ? "Freemium top-of-funnel kicks in here." : result.picks.pricing === "enterprise" ? "Your first six-figure contracts close in this window." : "Most of the API integrations that matter ship in this window."}`}
          />
          <PhaseCard
            tag="MONTHS 10–18"
            tagColor={C.gold}
            title="Saturation"
            stat={`$${Math.round(phases.late.revenue/100)/10}B`}
            share={`${Math.round(phases.late.share*100)}% of revenue`}
            text="The market reaches its addressable ceiling for this capability tier. A competitor releases. Adoption flattens; growth has to come from price or the next model."
          />
        </div>
      </FadeIn>
    </section>
  );
}

function BridgeRow({ label, value, color, kind, max, sign }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const valueLabel = `${sign || (kind === "in" ? "+" : kind === "out" ? "−" : "=")} $${Math.round(value).toLocaleString()}M`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 130px", gap: 14, alignItems: "center", padding: "8px 0" }}>
      <div style={{
        fontFamily: kind === "result" ? "var(--display)" : "var(--sans)",
        fontSize: kind === "result" ? 16 : 13,
        fontWeight: kind === "result" ? 700 : 500,
        color: kind === "result" ? color : C.dim,
        letterSpacing: kind === "result" ? 0 : 0.3,
      }}>{label}</div>
      <div style={{
        height: kind === "result" ? 14 : 10, background: C.faint, borderRadius: 4, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          opacity: kind === "out" ? 0.85 : 1,
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
      <div style={{
        fontFamily: "var(--display)",
        fontSize: kind === "result" ? 18 : 14,
        fontWeight: kind === "result" ? 800 : 700,
        color: color, textAlign: "right",
      }}>{valueLabel}</div>
    </div>
  );
}

function RatioCard({ label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", borderTop: `2px solid ${color}` }}>
      <div style={{ fontFamily: "var(--sans)", fontSize: 10, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 800, color: color, marginTop: 10, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.55, color: C.dim, marginTop: 10 }}>{sub}</div>
    </div>
  );
}

function PhaseCard({ tag, tagColor, title, stat, share, text }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", borderTop: `2px solid ${tagColor}` }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: tagColor, letterSpacing: 1.5, fontWeight: 700, marginBottom: 8 }}>{tag}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.accent }}>{stat}</div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: C.muted, letterSpacing: 0.5 }}>{share}</div>
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.6, color: C.dim }}>{text}</div>
    </div>
  );
}

function BigStat({ label, value, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color || C.accent }} />
      <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 800, color: color || C.text, marginTop: 12, lineHeight: 1 }}>{value}</div>
    </div>
  );
}


const GLOSSARY_TERMS = [
  { term: "RLHF", def: "Reinforcement Learning from Human Feedback. Humans rate model outputs; the model is trained to produce more of the highly-rated kind. Expensive — annotators are paid by the hour — but it's what makes a frontier model usable for ordinary people instead of just researchers." },
  { term: "MoE", def: "Mixture-of-Experts. The model is split into many specialist sub-networks; only a few activate per token instead of the whole thing. You get the capability of a huge model at a fraction of the serving cost." },
  { term: "$/Mtok", def: "Dollars per million tokens. The standard unit of AI cost. A token is roughly three-quarters of a word. Frontier models in 2026 cost $2–$10 per million tokens to serve and price at $5–$20 per million tokens to charge." },
  { term: "TPU", def: "Tensor Processing Unit. Google's custom AI chip, designed in-house. Cheaper to manufacture than NVIDIA GPUs at the scales Google operates at. Locked to Google Cloud." },
  { term: "CUDA", def: "NVIDIA's software platform that turns their GPUs into general-purpose AI hardware. The reason every AI researcher knows NVIDIA chips and almost no one knows the alternatives." },
  { term: "Capex / Opex", def: "Capital expenditure (one-time, like buying a chip) vs operating expenditure (recurring, like the electricity to run it). The single biggest financial story in 2026 AI is opex catching up to capex — serving the model now costs more than building it." },
  { term: "Gross margin", def: "Revenue minus the cost of producing the thing being sold, divided by revenue. For an AI lab, the cost of producing a query is mostly compute and electricity. Healthy frontier-AI gross margins in 2026 are 30–60%." },
  { term: "Vera CPU", def: "NVIDIA's ARM-based CPU, designed to pair with their Blackwell GPUs. Excels at the orchestration around model calls — the part that makes agentic queries (where a model does multiple steps to answer one question) much cheaper to run." },
  { term: "Inference", def: "What happens every time a user sends a query: the trained model is loaded onto chips and runs the math to produce an answer. Inference is recurring; training is one-time." },
  { term: "Inference Wall", def: "The 2026 phenomenon where the cost to serve a model in production overtakes the cost of training it. Multiple AI startups hit this and collapsed because they couldn't charge enough to cover their own COGS." },
];

function GlossaryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
          letterSpacing: 1.5, textTransform: "uppercase",
          background: C.card, color: C.accent,
          border: `1px solid ${C.accent}40`,
          padding: "10px 16px", borderRadius: 999, cursor: "pointer",
          boxShadow: "0 12px 36px rgba(0,0,0,.5)",
        }}
      >Glossary</button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "32px 36px", maxWidth: 720,
            maxHeight: "85vh", overflow: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>GLOSSARY</div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>The words behind the dollars</h3>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 24, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
            </div>
            {GLOSSARY_TERMS.map((g) => (
              <div key={g.term} style={{ padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: C.accent, letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>{g.term}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6, color: C.dim }}>{g.def}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}



/* ============================================================
   CONCEPTS — short explainers that fire before each decision
   ============================================================ */

const CONCEPTS = {
  compute: {
    tag: "BEFORE YOU CHOOSE A CHIP",
    title: "Why this is the most expensive thing you'll do",
    body: "AI training runs on specialized chips that cost $30,000–$60,000 each, in clusters of tens of thousands. The vendor you pick — NVIDIA or Google's in-house TPUs — sets your training budget, your serving cost forever, and how easily you can hire researchers. Every other decision in this game is downstream of this one.",
  },
  datacenter: {
    tag: "BEFORE YOU CHOOSE WHERE THE CHIPS LIVE",
    title: "Power is the binding constraint, not silicon",
    body: "A frontier-AI campus in 2026 needs 100–500 megawatts of continuous electricity — roughly what a small city consumes. The chips are available; the power is not. This is why hyperscalers are signing 20-year nuclear contracts and reactivating Three Mile Island. Where you put your chips determines your inference cost for the model's lifetime.",
  },
  architecture: {
    tag: "BEFORE YOU CHOOSE A MODEL DESIGN",
    title: "Two ways to build a brain",
    body: "Dense models fire every parameter for every token — simple, predictable, expensive at scale. Mixture-of-Experts splits the model into specialists; only a few activate per token, so you get the capability of a giant model at a fraction of the serving cost. The tradeoff is complexity: MoE is harder to debug and is co-designed with specific silicon (Google TPU). Most frontier labs in 2026 are MoE.",
  },
  data: {
    tag: "BEFORE YOU CHOOSE A DATA STRATEGY",
    title: "The web is no longer free",
    body: "In 2022 you could train on the open web for almost nothing. By 2026, half the web is AI-generated text and the other half is behind a publisher paywall. Frontier labs now budget $80–$320M per training run for human annotators (RLHF) and licensed corpora. The shortcut here is moderation costs you'll pay later — every news cycle about your model misbehaving is a P&L line.",
  },
  talent: {
    tag: "BEFORE YOU CHOOSE A TEAM",
    title: "Frontier ML researchers cost more than bankers",
    body: "A senior researcher who has trained a frontier model from scratch is one of about 500 people on Earth. Compensation runs $1–4M/year. The choice isn't 'how many can we afford' — it's 'how big does our research org need to be to compete', knowing every additional person adds coordination overhead.",
  },
  inference: {
    tag: "BEFORE YOU CHOOSE WHAT RUNS THE MODEL",
    title: "Training is the entrance fee. Inference is the subscription.",
    body: "The chip you serve users on determines your cost-per-query for the entire life of the model. NVIDIA's Blackwell GPUs paired with Vera CPUs are best for agentic queries (multi-step tool calls). Google's TPU v8i is cheapest for raw throughput. Reusing your training chips saves capex but costs you about 2× more per query forever.",
  },
  product: {
    tag: "BEFORE YOU CHOOSE WHAT TO SHIP",
    title: "Each product surface is a multiplier on your cost",
    body: "A chat query runs the model once. An agentic query (where the model uses tools, retries, and plans) runs it several times. A one-minute video generation runs it close to a thousand times. Each step up the product ladder unlocks more revenue but multiplies your inference bill. Ship what your serving cost can absorb — not what your competitors are demoing.",
  },
  openness: {
    tag: "BEFORE YOU CHOOSE HOW TO RELEASE IT",
    title: "Should the world have your model's weights?",
    body: "Closed-weight means the model lives only on your servers. Open-weight means anyone can download and run it themselves — you lose direct revenue from those users but gain developer mindshare, recruiting power, and a kind of regulatory cover (open weights are public; closed weights are proprietary obligations). The biggest 2026 strategic split between the major labs runs along this exact line.",
  },
  pricing: {
    tag: "BEFORE YOU CHOOSE A BUSINESS MODEL",
    title: "Pricing is the last lever",
    body: "Freemium gets you 100M users and a hole in the P&L unless your serving cost is genuinely tiny. Premium API pricing ($5–10/Mtok) is the standard frontier-lab approach — every query is gross-margin positive on day one. Enterprise pricing (six-figure contracts, $20+/Mtok blended) is the only model that produces profitable quarters in year one — but the sales cycle is three quarters long.",
  },
};

function ConceptInsert({ concept }) {
  const [skipped, setSkipped] = useState(false);
  if (skipped || !concept) return null;
  return (
    <FadeIn>
      <div className="rpg-section-padding" style={{
        margin: "60px 0 0",
        padding: "26px 30px",
        background: C.surface, border: `1px solid ${C.accent2}30`,
        borderLeft: `3px solid ${C.accent2}`,
        borderRadius: 12,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.accent2, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>{concept.tag}</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 12 }}>{concept.title}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.7, color: C.dim, maxWidth: 760 }}>{concept.body}</div>
          </div>
          <button
            onClick={() => setSkipped(true)}
            style={{
              fontFamily: "var(--mono)", fontSize: 9, color: C.muted,
              background: "transparent", border: `1px solid ${C.border}`,
              padding: "6px 11px", borderRadius: 999, cursor: "pointer",
              letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap",
            }}
          >Skip</button>
        </div>
      </div>
    </FadeIn>
  );
}

/* ============================================================
   CALIBRATION PROMPT — fires before live-ops, reveal in Reckoning
   ============================================================ */

function CalibrationPrompt({ onAnswer, current }) {
  const options = [
    { id: "low", label: "Below $2 / Mtok", note: "TPU + chat-only territory" },
    { id: "mid_low", label: "$2 – $5 / Mtok", note: "Standard frontier serving" },
    { id: "mid_high", label: "$5 – $12 / Mtok", note: "Agentic territory" },
    { id: "high", label: "Above $12 / Mtok", note: "Video, or wrong stack" },
  ];
  return (
    <FadeIn>
      <div className="rpg-section-padding" style={{
        margin: "60px 0 0",
        padding: "30px 32px",
        background: C.surface, border: `1px solid ${C.gold}30`,
        borderLeft: `3px solid ${C.gold}`,
        borderRadius: 12,
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.gold, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>BEFORE WE HIT GO</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>What do you think your serving cost will be?</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6, color: C.dim, marginBottom: 22, maxWidth: 720 }}>
          Pick one. We'll show you the actual number in the Reckoning. The point isn't to be right — it's to see how much your intuition lines up with the model.
        </div>
        <div className="rpg-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => onAnswer(o.id)}
              style={{
                textAlign: "left", padding: "14px 16px",
                background: current === o.id ? C.glow : C.card,
                border: `1px solid ${current === o.id ? C.gold : C.border}`,
                borderRadius: 10, cursor: "pointer",
                fontFamily: "var(--sans)", color: C.text,
              }}
            >
              <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: "var(--mono)", letterSpacing: 0.5 }}>{o.note}</div>
            </button>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

function CalibrationReveal({ guess, actual }) {
  if (!guess) return null;
  const buckets = {
    low: [0, 2],
    mid_low: [2, 5],
    mid_high: [5, 12],
    high: [12, 999],
  };
  const [lo, hi] = buckets[guess] || [0, 999];
  const right = actual >= lo && actual < hi;
  const labels = { low: "below $2", mid_low: "$2–$5", mid_high: "$5–$12", high: "above $12" };
  return (
    <FadeIn>
      <div style={{
        background: C.card, border: `1px solid ${right ? C.emerald : C.gold}40`,
        borderLeft: `3px solid ${right ? C.emerald : C.gold}`,
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: right ? C.emerald : C.gold, letterSpacing: 1.5, fontWeight: 700, marginBottom: 8 }}>YOUR CALIBRATION</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          You guessed <span style={{ color: right ? C.emerald : C.gold }}>{labels[guess]}</span>. Actual: <span style={{ color: C.accent }}>${actual.toFixed(2)}/Mtok</span>.
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.6, color: C.dim }}>
          {right ? "Calibrated. Your intuition matches the model." : "Outside your range. The actual answer depends on the multiplicative compounding of feature multiplier, archMult, and powerMult — easy to under- or over-estimate."}
        </div>
      </div>
    </FadeIn>
  );
}


/* ============================================================
   APP
   ============================================================ */

export default function AILabRPG() {
  const [picks, setPicks] = useState({});
  const [calibration, setCalibration] = useState(null);
  const [archetype, setArchetype] = useState(null);
  const [shocksOn, setShocksOn] = useState(false);
  const [pivot, setPivot] = useState(null);
  const [phase, setPhase] = useState("cold"); // cold | build | trained | launch | live | done
  const buildIds = DECISIONS.filter((d) => d.act === "build").map((d) => d.id);
  const launchIds = DECISIONS.filter((d) => d.act === "launch").map((d) => d.id);
  const allBuilt = buildIds.every((id) => picks[id]);
  const allLaunched = launchIds.every((id) => picks[id]);

  // Computed state for HUD
  const liveResult = useMemo(() => {
    if (allBuilt && allLaunched) return simulate(picks, archetype, pivot, shocksOn);
    return null;
  }, [picks, allBuilt, allLaunched, archetype, pivot, shocksOn]);

  const partialResult = useMemo(() => {
    if (allBuilt) return simulate({ ...picks, inference: picks.inference || "tpu_v8i", product: picks.product || "chat_only", openness: picks.openness || "closed", pricing: picks.pricing || "premium_api" }, archetype);
    return null;
  }, [picks, allBuilt, archetype]);

  // HUD live values
  const hudState = useMemo(() => {
    let budget = archetype ? archetype.budget : 3000;
    let capability = 40 + (archetype && archetype.modifiers && archetype.modifiers.capStart ? archetype.modifiers.capStart : 0);
    Object.entries(picks).forEach(([dId, oId]) => {
      const dec = DECISIONS.find((d) => d.id === dId);
      if (!dec) return;
      const opt = dec.options.find((o) => o.id === oId);
      if (!opt) return;
      if (opt.effects.budget) budget += opt.effects.budget;
      if (opt.effects.capability) capability += opt.effects.capability;
    });
    let monthsElapsed = 0;
    if (phase === "trained" || phase === "launch") monthsElapsed = partialResult ? partialResult.trainMonths : 0;
    if (phase === "live") monthsElapsed = (partialResult ? partialResult.trainMonths : 0) + 9;
    if (phase === "done") monthsElapsed = (liveResult ? liveResult.trainMonths : 0) + 18;
    const infCostPerMtok = liveResult ? liveResult.infCostPerMtok : (partialResult ? partialResult.infCostPerMtok : 0);
    return { budget, capability: clamp(capability, 0, 100), monthsElapsed, infCostPerMtok };
  }, [picks, phase, liveResult, partialResult, archetype]);

  // Auto-advance phases
  useEffect(() => {
    if (phase === "build" && allBuilt) {
      const t = setTimeout(() => setPhase("trained"), 700);
      return () => clearTimeout(t);
    }
  }, [phase, allBuilt]);
  useEffect(() => {
    if (phase === "launch" && allLaunched && calibration) {
      const t = setTimeout(() => setPhase("live"), 700);
      return () => clearTimeout(t);
    }
  }, [phase, allLaunched, calibration]);

  function pickOption(decisionId) {
    return (optionId) => {
      setPicks((prev) => {
        if (prev[decisionId]) return prev; // locked
        return { ...prev, [decisionId]: optionId };
      });
    };
  }

  function reset() {
    setPicks({});
    setCalibration(null);
    setArchetype(null);
    setPivot(null);
    setPhase("cold");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replayFrom(decisionId) {
    const order = ["compute","datacenter","architecture","data","talent","inference","product","openness","pricing"];
    const idx = order.indexOf(decisionId);
    if (idx < 0) return;
    const next = {};
    for (let i = 0; i < idx; i++) next[order[i]] = picks[order[i]];
    setPicks(next);
    const buildSet = new Set(["compute","datacenter","architecture","data","talent"]);
    const launchSet = new Set(["inference","product","openness","pricing"]);
    if (buildSet.has(decisionId)) setPhase("build");
    else if (launchSet.has(decisionId)) setPhase("launch");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Filter decisions by phase
  const visibleBuild = phase !== "cold";
  const visibleTrained = phase === "trained" || phase === "launch" || phase === "live" || phase === "done";
  const visibleLaunch = phase === "launch" || phase === "live" || phase === "done";
  const visibleLive = phase === "live" || phase === "done";
  const visibleDone = phase === "done";

  // Promote phase 'trained' → 'launch' once user scrolls past trained
  // Promote 'live' → 'done' once events render — handled by ActLiveOps with timeout below.
  useEffect(() => {
    if (phase === "live" && liveResult) {
      const total = liveResult.series.length * 280 + 1500 * liveResult.events.events.length + 800;
      const t = setTimeout(() => setPhase("done"), total);
      return () => clearTimeout(t);
    }
  }, [phase, liveResult]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "var(--sans)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
      <style>{`
        :root {
          --display: 'Playfair Display', Georgia, serif;
          --serif: 'Source Serif 4', Georgia, serif;
          --sans: 'Outfit', system-ui, sans-serif;
          --mono: 'IBM Plex Mono', monospace;
        }
        body { margin: 0; background: ${C.bg}; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        button:hover { transform: translateY(-1px); box-shadow: 0 16px 44px ${C.accent}55; }

        /* Mobile responsive */
        @media (max-width: 760px) {
          .rpg-options { grid-template-columns: 1fr !important; }
          .rpg-hud-grid { grid-template-columns: 1fr 1fr 1fr !important; gap: 8px !important; padding: 10px 16px !important; }
          .rpg-hud-cell-hide-mobile { display: none !important; }
          .rpg-hud-brand { display: none !important; }
          .rpg-section-padding { padding-left: 16px !important; padding-right: 16px !important; }
          .rpg-h1 { font-size: 38px !important; }
          .rpg-h2 { font-size: 30px !important; }
          .rpg-grid-2 { grid-template-columns: 1fr !important; }
          .rpg-bridge-row { grid-template-columns: 130px 1fr 96px !important; gap: 8px !important; }
          .rpg-retro-card { grid-template-columns: 32px 1fr !important; gap: 12px !important; padding: 16px 18px !important; }
          .rpg-retro-verdict { display: none !important; }
          .rpg-phase-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .rpg-h1 { font-size: 32px !important; }
          .rpg-decision-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      {phase !== "cold" && <HUD state={hudState} launched={visibleLive} />}
      {phase !== "cold" && <GlossaryButton />}
      {phase !== "cold" && phase !== "done" && <ProgressIndicator picks={picks} phase={phase} />}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {phase === "cold" && <ActArchetypeSelect onSelect={(a) => { setArchetype(a); setPhase("build"); }} shocksOn={shocksOn} onShocksToggle={setShocksOn} />}
        {visibleBuild && (
          <>
            {!allBuilt && (
              <FadeIn>
                <div style={{ paddingTop: 100, paddingBottom: 8 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.accent, fontWeight: 700 }}>ACT I · BUILD</div>
                  <h1 style={{ fontFamily: "var(--display)", fontSize: 56, fontWeight: 800, color: C.text, lineHeight: 1.05, margin: "10px 0 14px", letterSpacing: -0.8 }}>The five decisions that spend your training budget.</h1>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7, color: C.dim, margin: "0 0 0", maxWidth: 760, fontStyle: "italic" }}>
                    Each one is irreversible. The capex hits when you click. The capability score updates in the bar at the top. Don't try to optimize on your first run — just see where the money goes.
                  </p>
                </div>
              </FadeIn>
            )}
            {DECISIONS.filter((d) => d.act === "build").map((d, i) => {
              const prev = i === 0 ? true : !!picks[buildIds[i - 1]];
              if (!prev) return null;
              return (
                <div key={d.id}>
                  {!picks[d.id] && CONCEPTS[d.id] && <ConceptInsert concept={CONCEPTS[d.id]} />}
                  <DecisionPanel
                    decision={d}
                    picked={picks[d.id]}
                    onPick={pickOption(d.id)}
                    locked={!!picks[d.id]}
                    runState={hudState}
                  />
                </div>
              );
            })}
          </>
        )}
        {visibleTrained && partialResult && (
          <ActTraining result={partialResult} log={partialResult.events.log} />
        )}
        {phase === "trained" && (
          <FadeIn>
            <div style={{ padding: "20px 0 80px", textAlign: "center" }}>
              <button onClick={() => setPhase("launch")} style={btnPrimary}>Launch the model →</button>
            </div>
          </FadeIn>
        )}
        {visibleLaunch && (
          <>
            <FadeIn>
              <div style={{ paddingTop: 60, paddingBottom: 8 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: C.accent2, fontWeight: 700 }}>ACT II · LAUNCH</div>
                <h1 style={{ fontFamily: "var(--display)", fontSize: 56, fontWeight: 800, color: C.text, lineHeight: 1.05, margin: "10px 0 14px", letterSpacing: -0.8 }}>Three decisions that determine what running it actually costs.</h1>
                <p style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.7, color: C.dim, margin: "0 0 0", maxWidth: 760, fontStyle: "italic" }}>
                  Training is the entrance fee. Inference is the subscription. Pick the silicon, the surface, and the price.
                </p>
              </div>
            </FadeIn>
            {DECISIONS.filter((d) => d.act === "launch").map((d, i) => {
              const prev = i === 0 ? true : !!picks[launchIds[i - 1]];
              if (!prev) return null;
              return (
                <div key={d.id}>
                  {!picks[d.id] && CONCEPTS[d.id] && <ConceptInsert concept={CONCEPTS[d.id]} />}
                  <DecisionPanel
                    decision={d}
                    picked={picks[d.id]}
                    onPick={pickOption(d.id)}
                    locked={!!picks[d.id]}
                    runState={hudState}
                  />
                </div>
              );
            })}
          </>
        )}
        {phase === "launch" && allLaunched && !calibration && (
          <CalibrationPrompt onAnswer={setCalibration} current={calibration} />
        )}
        {visibleLive && liveResult && <ActLiveOps result={liveResult} pivot={pivot} onPivotPick={setPivot} />}
        {visibleDone && liveResult && <ActReckoning result={liveResult} calibration={calibration} />}
        {visibleDone && liveResult && <ActScorecard result={liveResult} onReplay={reset} onReplayFrom={replayFrom} />}
        <SourcesAppendix />
      </div>
    </div>
  );
}


const SOURCES = [
  { n: 1, claim: "Frontier model training cost: $0.6–1.2B", src: "Epoch AI, 2025 frontier-model cost survey; Anthropic / OpenAI public earnings commentary" },
  { n: 2, claim: "NVIDIA gross margin: ~75%", src: "NVIDIA Q4 FY25 10-K, datacenter segment" },
  { n: 3, claim: "Google TPU 30–50% capex advantage at integrated scale", src: "Semianalysis, \"The TPU Stack\", Dec 2024" },
  { n: 4, claim: "Inference cost split: 40% compute / 25% power / 12% safety / 23% infra", src: "Stylized from Sequoia AI economics analysis (\"AI's $600B Question\", 2024) and primary-source datacenter cost breakdowns" },
  { n: 5, claim: "Power as #1 constraint on inference margin", src: "Microsoft / Constellation Three Mile Island deal, Sep 2024; Google × Kairos SMR deal, Oct 2024" },
  { n: 6, claim: "$2–10/Mtok serving cost range", src: "Public API price-setting at OpenAI / Anthropic / Google; Together.ai / Fireworks reference pricing" },
  { n: 7, claim: "MoE on TPU: training-time and serving-cost advantages", src: "Google's Pathways / Gemini technical reports; Mixtral / DeepSeek MoE benchmarks" },
  { n: 8, claim: "Vera + Blackwell agentic optimization", src: "NVIDIA GTC 2025 keynote; NVIDIA developer blog on Vera CPU + Blackwell pairing" },
  { n: 9, claim: "Inference Wall · 2026 cost crossover", src: "The Information, multiple Q4 2025 / Q1 2026 reports; Inflection AI collapse, March 2024" },
  { n: 10, claim: "RLHF + licensed corpora costs", src: "OpenAI × FT licensing deal (April 2024), various publisher LLM-licensing announcements" },
];

function SourcesAppendix() {
  return (
    <section style={{ borderTop: `1px solid ${C.border}`, marginTop: 80, padding: "60px 0 80px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>NOTES & SOURCES</div>
      <h3 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1.2, margin: "0 0 14px", letterSpacing: -0.4 }}>
        Where the numbers came from
      </h3>
      <p style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.7, color: C.dim, margin: "0 0 32px", maxWidth: 760, fontStyle: "italic" }}>
        Every dollar in this game is stylized — but anchored to the public record on frontier-AI economics. Names of labs and products are fictional; the orders of magnitude are not.
      </p>
      <div>
        {SOURCES.map((s) => (
          <div key={s.n} style={{
            display: "grid", gridTemplateColumns: "32px 1fr",
            gap: 14, padding: "14px 0",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 0.5 }}>[{s.n}]</div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{s.claim}</div>
              <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: C.muted, lineHeight: 1.5, fontStyle: "italic" }}>{s.src}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, marginTop: 80, padding: "30px 0 60px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>ABOUT THE NUMBERS</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.7, color: C.dim, fontStyle: "italic", maxWidth: 780 }}>
        The economics in this site are a stylized but grounded approximation of what the public record says about frontier-AI capex and opex in 2026:
        $0.6–1.2B training runs, NVIDIA's 75% gross margin, Google TPU's 30–50% capex advantage on integrated builds,
        $2–5 per million tokens for serving, agentic ~6× compute overhead, and video generation near training-cost parity per minute.
        Names are fictional; the orders of magnitude are not.
      </div>
    </footer>
  );
}
