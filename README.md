# Nordic Raven Solutions - Portfolio Website

Professional portfolio website showcasing AI/ML projects and data analytics solutions.

## Live Site
[https://nordicravensolutions.com](https://nordicravensolutions.com)

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel (free tier)
- **Domain**: nordicravensolutions.com (Cloudflare)

## Features
- 🎨 Modern, responsive design (mobile/tablet/desktop)
- 🌙 Dark mode support (automatic based on system preference)
- 📱 Mobile-first approach
- ⚡ Optimized performance (Core Web Vitals)
- 🔍 SEO optimized
- ♿ Accessible (WCAG compliant)

## Project Structure
```
portfolio/
├── app/
│   ├── components/
│   │   ├── Header.tsx        # Navigation header
│   │   ├── Hero.tsx          # Landing hero section
│   │   ├── About.tsx         # About section
│   │   ├── Projects.tsx      # Projects showcase grid
│   │   ├── Contact.tsx       # Contact form
│   │   └── Footer.tsx        # Footer
│   ├── globals.css           # Global styles & Tailwind
│   ├── layout.tsx            # Root layout & metadata
│   └── page.tsx              # Main page assembly
├── public/                   # Static assets
└── package.json
```

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment to Vercel

### Option 1: Git-based Deployment (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Vercel auto-detects Next.js and deploys
4. Every push triggers automatic redeployment

### Option 2: CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables
No environment variables required for basic functionality.

For contact form integration (future):
- Add Formspree endpoint or similar service
- Configure in `app/components/Contact.tsx`

## Custom Domain Setup

### Transfer Domain from Squarespace
1. Unlock domain in Squarespace settings
2. Get authorization code (EPP code)
3. Transfer to Cloudflare Registrar (~$10/year)
4. Update nameservers to Cloudflare

### Connect Domain to Vercel
1. In Vercel project settings → Domains
2. Add `nordicravensolutions.com`
3. Add DNS records in Cloudflare:
   - A record: `@` → Vercel IP
   - CNAME: `www` → `cname.vercel-dns.com`
4. SSL certificate auto-provisions

## Performance Optimizations
- ✅ Image optimization with Next.js Image component
- ✅ Font optimization (Geist fonts loaded efficiently)
- ✅ Code splitting and lazy loading
- ✅ Static generation for fast page loads
- ✅ CDN edge caching on Vercel

## Future Enhancements
- [ ] Blog section for technical writeups
- [ ] Case studies for each project
- [ ] Newsletter signup integration
- [ ] Analytics dashboard (Vercel Analytics or Plausible)
- [ ] Testimonials section
- [ ] More project showcases

## Cost Breakdown
- Domain: ~$10/year (~75 DKK/year)
- Hosting: FREE (Vercel free tier)
- **Total: ~75 DKK/year = ~19 DKK per 3 months**

### Vercel Free Tier Limits
- ✅ Unlimited bandwidth
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ 100 GB-hours compute time (plenty for portfolio)
- ✅ Unlimited personal projects

## Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## License
All rights reserved © Nordic Raven Solutions

## Contact
- Website: [nordicravensolutions.com](https://nordicravensolutions.com)
- Email: contact@nordicravensolutions.com
- GitHub: [@jonas](https://github.com/jonas)

---

**Built with ❤️ using Next.js and Tailwind CSS**
