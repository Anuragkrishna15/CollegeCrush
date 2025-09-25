# 🚀 Vercel Deployment Guide for CollegeCrush

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Anuragkrishna15/CollegeCrush)

## Manual Deployment Steps

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com) and sign in
2. **Import Project**: Click "Add New..." → "Project"
3. **Connect GitHub**: Import from `https://github.com/Anuragkrishna15/CollegeCrush`
4. **Configure**:
   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
5. **Environment Variables**:
   - Add: `GEMINI_API_KEY` = `your_actual_api_key`
6. **Deploy**: Click "Deploy" button

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key for AI features | Optional |

## Build Information

- **Framework**: React + TypeScript + Vite
- **Build Time**: ~15 seconds
- **Output Size**: ~720KB (gzipped)
- **Node Version**: 18+

Your CollegeCrush app will be live in 2-3 minutes! 🎉
