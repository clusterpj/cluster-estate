# Cluster Estate Platform

A high-end real estate platform connecting international buyers with luxury properties on the North Coast of the Dominican Republic. Built with Next.js and focused on delivering an exceptional user experience for property browsing and inquiry management.

## Project Overview

Cluster Estate is a Progressive Web App (PWA) designed to showcase luxury properties in:
- Sosua
- Cabarete (Puerto Plata)
- Las Terrenas (Samana)

### Key Features

- 🌐 Multi-language support (English, French, German, Spanish)
- 💱 Multi-currency conversion
- 🏠 Advanced property search and filtering
- 👤 User accounts with favorites and notifications
- 📱 Mobile-first, responsive design
- ⚡ PWA capabilities with offline support
- 📝 Integrated blog system
- 🔍 Robust SEO optimization
- 📊 Analytics dashboard for admins

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Internationalization**: Built-in i18n
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm
- Supabase account and project

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/clusterpj/cluster-estate.git
cd cluster-estate
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy the environment variables:
```bash
cp .env.example .env.local
```

4. Update the .env.local with your Supabase credentials and other required variables.

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
pnpm build
```

### Running Tests

```bash
pnpm test
```

## Project Structure

```
cluster-estate/
├── app/                  # Next.js app router pages and layouts
├── components/          # Reusable UI components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and functions
├── messages/           # Internationalization messages
├── public/             # Static assets
├── scripts/            # Build and utility scripts
├── supabase/          # Supabase related configurations
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Features in Detail

### For Users
- Advanced property search with filters
- Property favoriting and saving
- Multi-currency price display
- Inquiry system for properties
- User notification preferences
- Mobile-responsive interface

### For Administrators
- Comprehensive listing management
- Customer inquiry tracking
- Analytics dashboard
- Content management system
- SEO optimization tools

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Contact

Project Link: [https://github.com/clusterpj/cluster-estate](https://github.com/clusterpj/cluster-estate)

---

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for font optimization.