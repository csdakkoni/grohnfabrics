# Grohn Fabrics

Premium textile e-commerce platform built with Next.js 15, Supabase, and TypeScript.

## Tech Stack

- **Frontend:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Image Processing:** Sharp
- **Styling:** Tailwind CSS v4
- **Payment:** Iyzico (TR) + Stripe (Global)
- **Shipping:** Yurtiçi Kargo (TR) + UPS (Global)

## Features

- Multi-market support (Turkey / Global)
- Multi-currency (TRY, USD, EUR)
- Product types: Fabric (meter), Pillow (unit), Curtain (preset sizes)
- Advanced variant system
- Roll-based fabric stock tracking
- Admin panel with RBAC
- SEO optimized

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the values
3. Run database migrations in Supabase
4. Install dependencies: `npm install`
5. Run development server: `npm run dev`

## Database Setup

Run the migrations in order in Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

## Environment Variables

See `.env.example` for required environment variables.

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (store)/        # Storefront pages
│   ├── (admin)/        # Admin panel pages
│   └── api/            # API routes
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── store/          # Store-specific components
│   └── admin/          # Admin-specific components
├── lib/                # Utility libraries
│   └── supabase/       # Supabase clients
└── types/              # TypeScript types
```

## License

Private - All rights reserved.
