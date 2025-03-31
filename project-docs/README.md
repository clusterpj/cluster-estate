# Cluster Estate Platform 🏢

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green.svg)](https://supabase.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

A high-end real estate platform connecting international buyers with luxury properties on the North Coast of the Dominican Republic. Built with Next.js and focused on delivering an exceptional user experience for property browsing and inquiry management.

![Cluster Estate Banner](./public/banner.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## 🌟 Overview

Cluster Estate is a Progressive Web App (PWA) designed to showcase luxury properties in premier locations along the Dominican Republic's North Coast:

* **Sosua** - Known for its beautiful beaches and vibrant expat community
* **Cabarete (Puerto Plata)** - World-famous for water sports and coastal living
* **Las Terrenas (Samana)** - Offering pristine beaches and European charm

## ✨ Features

### For Buyers

* **Multilingual Interface**
  - Support for English, French, German, and Spanish
  - Seamless language switching
  - Localized content and descriptions

* **Property Search & Discovery**
  - Advanced filtering options
  - Interactive map view
  - Saved searches with notifications
  - Virtual tours and high-quality media

* **User Experience**
  - Mobile-first responsive design
  - Offline capability via PWA
  - Property comparison tools
  - Favorite properties list

### For Administrators

* **Listing Management**
  - Bulk property uploads
  - Media optimization
  - SEO tools and analytics
  - Inquiry tracking system

* **Analytics & Reporting**
  - User behavior tracking
  - Lead conversion metrics
  - Performance dashboards
  - Market trend analysis

## 🛠 Technology Stack

### Frontend
* **Framework**: Next.js 14 with TypeScript
* **Styling**: Tailwind CSS with custom theme
* **State Management**: React Context + Zustand
* **Forms**: React Hook Form with Zod validation

### Backend
* **Database**: Supabase (PostgreSQL)
* **Authentication**: Supabase Auth
* **Storage**: Supabase Storage
* **API**: Next.js API Routes

### Infrastructure
* **Hosting**: Vercel
* **CDN**: Vercel Edge Network
* **Media Processing**: Cloudinary
* **Monitoring**: Sentry

## 🚀 Getting Started

### Prerequisites

* Node.js 18.17 or later
* pnpm package manager
* Supabase account and project
* Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/clusterpj/cluster-estate.git
   cd cluster-estate
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Build for production**
   ```bash
   pnpm build
   ```

## 📁 Project Structure

```
cluster-estate/
├── app/                  # Next.js app router pages
│   ├── [locale]/        # Internationalized routes
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
│   ├── ui/             # UI components
│   └── features/       # Feature components
├── lib/                # Core utilities
├── hooks/              # Custom React hooks
├── store/              # State management
├── styles/             # Global styles
├── public/             # Static assets
└── types/              # TypeScript types
```

## 💡 Usage

### Property Search

```typescript
// Example of using the property search hook
const { properties, isLoading, error } = usePropertySearch({
  location: 'Sosua',
  propertyType: 'Villa',
  priceRange: { min: 100000, max: 500000 },
  amenities: ['pool', 'ocean-view']
});
```

### Internationalization

```typescript
// Example of language switching
const { setLocale, locale } = useLocale();
const switchToSpanish = () => setLocale('es');
```

## 📚 API Documentation

Detailed API documentation is available at `/docs/api` in the development environment. The documentation covers:

* Authentication endpoints
* Property search and filtering
* User preferences and favorites
* Media upload and processing
* Admin management routes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 🆘 Support

For support, please:

* Check our [documentation](https://docs.cluster-estate.com)
* Join our [Discord community](https://discord.gg/cluster-estate)
* Email us at support@cluster-estate.com

## 📄 License

This project is proprietary software. All rights reserved.

---

*Built with ❤️ by the Cluster Estate team*