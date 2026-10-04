# 🚀 How to Deploy TreeViz to Vercel (1-Click & Zero-Config)

This repository is pre-configured with `vercel.json` and ready for instant deployment on Vercel.

---

### Option 1: Deploy via GitHub (Recommended — 100% Free & Automatic Updates)

1. **Push your code to a GitHub repository**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/tree-visualizer.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import** next to your `tree-visualizer` repository.
   - Vercel automatically detects the Vite framework and `vercel.json`:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click **Deploy**! 🚀
   - Your website will be live at `https://tree-visualizer-yourname.vercel.app`.

---

### Option 2: Deploy via Vercel CLI (Instant from Terminal)

If you have a Vercel personal access token from [vercel.com/account/tokens](https://vercel.com/account/tokens):

```bash
npx vercel --token <YOUR_VERCEL_TOKEN> --prod --yes
```

---

### Option 3: Drag & Drop (No Git Needed)

1. The project has already built the production bundle into the `dist/` folder.
2. You can drag and drop the `dist/` folder directly to [vercel.com](https://vercel.com) or Netlify.
