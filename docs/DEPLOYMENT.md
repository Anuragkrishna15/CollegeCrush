# CollegeCrush Deployment Guide

This project is ready for deployment on various platforms. Choose one of the following:

## 🚀 Quick Deploy Options

### Vercel (Recommended)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set environment variable: `GEMINI_API_KEY=your_actual_api_key`
5. Deploy!

### Netlify
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect your GitHub repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Set environment variable: `GEMINI_API_KEY=your_actual_api_key`
7. Deploy!

### GitHub Pages
1. Go to your repository settings
2. Enable Pages from Actions
3. Use the provided GitHub Actions workflow

## 🔧 Environment Variables Required

- `GEMINI_API_KEY`: Your Google Gemini API key for AI features

## 📦 Build Commands

- Development: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## 🏗️ Project Structure

Built with:
- React 18.2.0
- TypeScript
- Vite 6.2.0
- Tailwind CSS (CDN)
- Supabase for backend
- Framer Motion for animations
