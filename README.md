# Blueprxnt Admin Dashboard

A modern, full-featured admin dashboard for managing the Blueprxnt website content without touching code.

## Features

- 🎨 **Content Management**: Edit all website content through an intuitive interface
- 📦 **Package Manager**: CRUD operations for coaching packages
- 🎯 **Branding Control**: Manage logo, colors, and typography
- 📊 **Analytics Dashboard**: View site metrics and performance
- ✨ **Live Preview**: See changes before publishing
- 🔐 **Secure Authentication**: Admin-only access with JWT
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **File Upload**: Uploadthing / Cloudinary
- **State Management**: React Context + SWR
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:3000/admin` for the dashboard.

### Default Admin Credentials

- Email: admin@blueprxnt.com
- Password: blueprxnt2024

⚠️ **Change these immediately after first login**

## Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Overview)
│   │   ├── content/
│   │   ├── packages/
│   │   ├── branding/
│   │   └── settings/
│   └── api/
│       ├── auth/
│       ├── content/
│       └── packages/
├── components/
│   ├── dashboard/
│   ├── editors/
│   └── ui/
├── lib/
│   ├── db/
│   ├── auth/
│   └── utils/
└── public/
```

## Environment Variables

```env
# Database
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Authentication
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# File Upload
UPLOADTHING_SECRET=your_uploadthing_secret
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Manual Deployment

```bash
npm run build
npm start
```

## Features in Detail

### Content Editor
- Edit homepage sections
- Manage about page
- Update coaching content
- Edit testimonials
- Modify footer

### Package Manager
- Create new packages
- Edit existing packages
- Reorder with drag & drop
- Delete packages

### Branding
- Upload logo
- Change brand colors
- Select fonts
- Theme toggle

### Live Edit Mode (Bonus)
- Click any text on the live site to edit
- Changes sync to dashboard
- Instant preview

## API Endpoints

### Content
- `GET /api/content` - Get all content
- `GET /api/content/:section` - Get specific section
- `PUT /api/content/:section` - Update section
- `POST /api/content/publish` - Publish changes

### Packages
- `GET /api/packages` - List all packages
- `POST /api/packages` - Create package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

## Database Schema

See `lib/db/schema.ts` for full schema.

## Contributing

This is a private admin dashboard. Contact the development team for access.

## License

Proprietary - All rights reserved
