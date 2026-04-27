# Aetheria · An interactive site about the economics of frontier AI

A vertical-scroll role-playing site that walks you through the decisions a frontier-AI lab faces in 2026 — chip vendor, datacenter, model architecture, data strategy, talent shape, inference hardware, product surface, open weights, pricing — and shows the consequences in budget, capability, and an animated 18-month P&L.

Audience: tech-curious, not engineers. The numbers are stylized but anchored to the public record on training cost, NVIDIA / TPU economics, and inference cost structure.

## Stack

- React 18 + Recharts, no Tailwind
- Vite single-page artifact
- Deployed to Vercel at [adib.ihsan.build/research](https://adib.ihsan.build/research)

## Local dev

```bash
cd viewer
npm install
npm run dev
```

The Vite app at `viewer/` mounts the artifact at `ai-lab-rpg.jsx` (one level up).

## Build

```bash
cd viewer
npm run build
```

Produces `viewer/dist/research/` with all assets pre-prefixed for the `/research` URL path.
