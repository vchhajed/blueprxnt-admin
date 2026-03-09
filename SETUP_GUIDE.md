# Blueprxnt Admin Dashboard - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Git** installed
- **Supabase account** (free tier works perfectly)
- **Code editor** (VS Code recommended)

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up
2. Create a new project
3. Wait for the database to initialize (~2 minutes)
4. Go to **Settings** > **API**
5. Copy your **Project URL** and **anon/public key**

### Step 2: Install Dependencies

```bash
cd admin-dashboard
npm install
```

### Step 3: Configure Environment

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your values
```

Minimum required variables:
```env
DATABASE_URL=your_supabase_connection_string
NEXTAUTH_SECRET=generate_using_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3001
```

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 4: Set Up Database

```bash
# Push the database schema to Supabase
npm run db:push

# Open Drizzle Studio to verify (optional)
npm run db:studio
```

### Step 5: Seed Initial Data (Optional)

Create a seed script or manually add:
- Initial admin user
- Default branding settings
- Sample content sections

```sql
-- Run this in Supabase SQL Editor

-- Create admin user
INSERT INTO users (email, password, name, role)
VALUES (
  'admin@blueprxnt.com',
  -- Password: blueprxnt2024 (hashed with bcrypt)
  '$2a$10$Xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'Admin User',
  'admin'
);

-- Create default branding
INSERT INTO branding (
  logo,
  primary_color,
  secondary_color,
  font_heading,
  font_body,
  theme
) VALUES (
  '/images/logo.png',
  '#0ea5e9',
  '#14b8a6',
  'Archivo',
  'Inter',
  'dark'
);
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3001/admin**

## 🔐 First Login

Default credentials (change immediately):
- **Email**: admin@blueprxnt.com
- **Password**: blueprxnt2024

## 📁 Project Structure Explained

```
admin-dashboard/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication pages
│   │   └── login/                # Login page
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Overview/homepage
│   │   ├── content/              # Content editor
│   │   ├── packages/             # Package management
│   │   ├── branding/             # Branding settings
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── applications/         # Coaching applications
│   │   ├── messages/             # Contact messages
│   │   └── settings/             # Admin settings
│   └── api/                      # API routes
│       ├── auth/                 # NextAuth endpoints
│       ├── content/              # Content CRUD
│       ├── packages/             # Packages CRUD
│       ├── branding/             # Branding updates
│       └── upload/               # File uploads
├── components/
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Header.tsx            # Top header
│   │   └── PageHeader.tsx        # Page headers
│   ├── editors/                  # Content editors
│   │   ├── HeroEditor.tsx        # Hero section editor
│   │   ├── AboutEditor.tsx       # About editor
│   │   ├── CoachingEditor.tsx    # Coaching editor
│   │   └── FooterEditor.tsx      # Footer editor
│   ├── dialogs/                  # Modal dialogs
│   │   └── PackageDialog.tsx     # Package create/edit dialog
│   └── ui/                       # Shadcn UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── db/                       # Database
│   │   ├── schema.ts             # Drizzle ORM schema
│   │   └── index.ts              # DB connection
│   ├── auth/                     # Authentication
│   │   └── index.ts              # NextAuth config
│   └── utils/                    # Utilities
│       └── cn.ts                 # Class name helper
├── public/                       # Static files
├── .env.local                    # Environment variables (create this)
├── .env.example                  # Example env file
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind config
└── tsconfig.json                 # TypeScript config
```

## 🎨 How Content Management Works

### Content Flow

```
Dashboard Editor → Database (Draft) → Publish → Live Website Files
```

1. **Edit**: Admin edits content in dashboard
2. **Save Draft**: Changes saved to database only
3. **Preview**: See changes before publishing
4. **Publish**: Updates actual HTML files in parent directory

### Publishing Process

When you click "Publish":
1. Content is validated
2. Database is updated with `published: true`
3. API route reads current HTML files
4. Regex/DOM manipulation updates specific sections
5. Updated HTML is written back to files
6. Live website reflects changes immediately

### Example: Hero Section Update

```typescript
// 1. Admin edits hero in dashboard
const newHero = {
  title: "New Headline",
  subtitle: "New subtitle"
};

// 2. Saves to database
await db.update(content)
  .set({ data: newHero })
  .where(eq(content.section, 'hero'));

// 3. Publishes to live site
const html = await fs.readFile('../index.html', 'utf-8');
const updated = html.replace(
  /<h1 class="hero-title">.*?<\/h1>/,
  `<h1 class="hero-title">${newHero.title}</h1>`
);
await fs.writeFile('../index.html', updated);
```

## 🔧 Configuration Options

### Tailwind CSS Customization

Edit `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',  // Your brand color
        secondary: '#14b8a6',
      },
    },
  },
}
```

### Database Schema Modifications

Edit `lib/db/schema.ts` and run:

```bash
npm run db:push
```

### Adding New Content Sections

1. Add section to database:
```typescript
await db.insert(content).values({
  section: 'new-section',
  data: { /* your structure */ }
});
```

2. Create editor component in `components/editors/`
3. Add tab to content page
4. Add publish handler in API route

## 🔐 Security Best Practices

### 1. Change Default Credentials

Immediately after first login, change admin password in Settings.

### 2. Secure Environment Variables

Never commit `.env.local` to Git. It's in `.gitignore` by default.

### 3. Use Strong Secrets

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Enable Row Level Security (RLS) in Supabase

```sql
-- Example RLS policy
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is viewable by authenticated users"
  ON content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Content is editable by admin only"
  ON content FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');
```

### 5. Set Up HTTPS in Production

Always use HTTPS for production deployments.

## 📊 Database Backup

### Automated Backups (Recommended)

Supabase automatically backs up your database daily.

### Manual Backup

```bash
# Using Supabase CLI
supabase db dump > backup.sql

# Restore
supabase db restore < backup.sql
```

## 🚢 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Option 2: Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "blueprxnt-admin" -- start
```

## 🐛 Troubleshooting

### "Database connection failed"

- Check `DATABASE_URL` in `.env.local`
- Verify Supabase project is active
- Check network connectivity

### "Unauthorized" errors

- Ensure `NEXTAUTH_SECRET` is set
- Clear cookies and login again
- Check database for user record

### Changes not appearing on live site

- Verify `WEBSITE_PATH` in `.env.local`
- Check file permissions
- Look for errors in publish API route logs

### Drizzle errors

```bash
# Reset schema
npm run db:push -- --force

# Or manually in Supabase
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## 📚 Advanced Features

### Live Edit Mode (Bonus)

Add this to your main website to enable inline editing:

```html
<!-- Add to website <head> -->
<script>
  if (sessionStorage.getItem('admin-edit-mode')) {
    document.body.classList.add('admin-edit-mode');
  }
</script>

<!-- Add styles -->
<style>
  .admin-edit-mode [data-editable] {
    outline: 2px dashed #0ea5e9;
    cursor: pointer;
  }
</style>

<!-- Add to website <body> -->
<script src="/admin-edit-mode.js"></script>
```

Create `admin-edit-mode.js`:

```javascript
if (sessionStorage.getItem('admin-edit-mode')) {
  document.addEventListener('click', (e) => {
    const editable = e.target.closest('[data-editable]');
    if (!editable) return;

    e.preventDefault();
    const section = editable.dataset.section;
    const field = editable.dataset.field;
    const value = editable.textContent;

    // Open inline editor
    showInlineEditor(section, field, value);
  });
}
```

### Analytics Integration

Track content changes:

```typescript
// Add to content publish handler
await db.insert(activityLog).values({
  userId: session.user.id,
  action: 'content_published',
  resource: 'hero',
  details: { changes: diff(old, new) }
});
```

## 🆘 Support

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open database GUI

# Linting
npm run lint             # Run ESLint
```

## ✅ Checklist

Before going live:

- [ ] Changed default admin credentials
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configured production database
- [ ] Set up file upload service
- [ ] Tested all CRUD operations
- [ ] Verified publishing works
- [ ] Set up backups
- [ ] Enabled HTTPS
- [ ] Tested mobile responsiveness
- [ ] Set up error monitoring (Sentry, etc.)

## 🎉 You're Ready!

Your admin dashboard is now fully configured. Start managing your Blueprxnt website without touching code!

For questions or issues, refer to the main README.md or check the inline code comments.
