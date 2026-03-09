# Blueprxnt Admin Dashboard - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                         │
│                    (Next.js 14 App)                         │
│                  http://localhost:3001                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├──> Authentication (NextAuth.js)
                       │    └──> Session Management
                       │
                       ├──> API Routes
                       │    ├──> /api/content
                       │    ├──> /api/packages
                       │    ├──> /api/branding
                       │    └──> /api/upload
                       │
                       ├──> Database (Supabase PostgreSQL)
                       │    ├──> users
                       │    ├──> content
                       │    ├──> packages
                       │    ├──> branding
                       │    ├──> testimonials
                       │    ├──> applications
                       │    └──> subscribers
                       │
                       └──> File System (Publishing)
                            └──> ../index.html
                            └──> ../about.html
                            └──> ../coaching.html
                            └──> etc.
```

## Data Flow Diagram

### Content Management Flow

```
Admin User
    │
    ├─> Login ──────────> NextAuth ──────────> Verify Credentials
    │                                                   │
    │                                                   ├─> Create Session
    │                                                   └─> Set Cookie
    │
    ├─> Edit Content
    │       │
    │       ├─> Open Editor Component
    │       ├─> Make Changes
    │       ├─> Click "Save Draft"
    │       │       │
    │       │       ├─> POST /api/content
    │       │       ├─> Validate Session
    │       │       ├─> Save to Database (published: false)
    │       │       └─> Return Success
    │       │
    │       └─> Click "Publish"
    │               │
    │               ├─> POST /api/content/publish
    │               ├─> Validate Session
    │               ├─> Get Content from DB
    │               ├─> Update published: true
    │               ├─> Read HTML File(s)
    │               ├─> Replace Content Sections
    │               ├─> Write Updated HTML
    │               └─> Return Success
    │
    └─> View Live Site ──────────> See Updated Content
```

### Package Management Flow

```
Admin User
    │
    ├─> Create Package
    │       │
    │       ├─> Open Package Dialog
    │       ├─> Fill Form
    │       ├─> POST /api/packages
    │       ├─> Insert into Database
    │       └─> Refresh List
    │
    ├─> Edit Package
    │       │
    │       ├─> Click Edit Button
    │       ├─> Modify Form
    │       ├─> PUT /api/packages/:id
    │       ├─> Update in Database
    │       └─> Refresh List
    │
    ├─> Reorder Packages
    │       │
    │       ├─> Drag & Drop
    │       ├─> PATCH /api/packages/reorder
    │       ├─> Update order field
    │       └─> Refresh List
    │
    └─> Delete Package
            │
            ├─> Click Delete
            ├─> Confirm
            ├─> DELETE /api/packages/:id
            ├─> Remove from Database
            └─> Refresh List
```

## Component Architecture

### Dashboard Layout

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── Navigation Items
│   │   ├── Overview
│   │   ├── Analytics
│   │   ├── Packages
│   │   ├── Content ⭐
│   │   ├── Branding
│   │   └── Settings
│   └── User Profile
│       └── Logout Button
│
└── Main Content Area
    ├── Header
    │   ├── Page Title
    │   ├── Breadcrumbs
    │   └── User Menu
    │
    └── Page Content
        └── {children}
```

### Content Editor Structure

```
ContentPage
├── Page Header
├── Action Toolbar
│   ├── Preview Button
│   ├── Save Draft Button
│   └── Publish Button
│
└── Tabs
    ├── Hero Tab
    │   └── HeroEditor
    │       ├── Text Inputs
    │       ├── CTA Buttons Config
    │       ├── Image Upload
    │       └── Live Preview
    │
    ├── About Tab
    │   └── AboutEditor
    │       ├── Rich Text Editor
    │       ├── Image Gallery
    │       └── Section Manager
    │
    ├── Coaching Tab
    │   └── CoachingEditor
    │       ├── Package List
    │       └── Package Editor
    │
    ├── Testimonials Tab
    │   └── TestimonialsEditor
    │       ├── Testimonial List
    │       ├── Add/Edit Forms
    │       └── Reorder Interface
    │
    └── Footer Tab
        └── FooterEditor
            ├── Links Manager
            ├── Social Media Config
            └── Copyright Text
```

## Database Schema Overview

### Core Tables

**users** - Admin users who can access the dashboard
```sql
id, email, password, name, role, avatar, created_at, updated_at
```

**content** - Website content sections
```sql
id, section, data (JSONB), published, published_at, updated_by, created_at, updated_at
```

**packages** - Coaching packages
```sql
id, name, slug, description, price, duration, features (JSONB),
cta_text, cta_link, order, active, recommended, created_at, updated_at
```

**branding** - Brand settings
```sql
id, logo, logo_dark, favicon, primary_color, secondary_color,
accent_color, font_heading, font_body, theme, updated_at
```

**testimonials** - Client testimonials
```sql
id, name, role, company, content, avatar, rating,
featured, order, active, created_at
```

**applications** - Coaching applications
```sql
id, name, email, phone, data (JSONB), status,
notes, created_at, updated_at
```

**subscribers** - Newsletter subscribers
```sql
id, email, name, subscribed, source,
subscribed_at, unsubscribed_at
```

**messages** - Contact form messages
```sql
id, name, email, service, message, read,
replied, created_at
```

**activity_log** - Audit trail
```sql
id, user_id, action, resource, resource_id,
details (JSONB), created_at
```

## API Endpoints Reference

### Authentication

```
POST   /api/auth/signin        # Login
POST   /api/auth/signout       # Logout
GET    /api/auth/session       # Get current session
```

### Content Management

```
GET    /api/content            # Get all content
GET    /api/content?section=X  # Get specific section
PUT    /api/content            # Update content section
POST   /api/content/publish    # Publish to live site
```

### Packages

```
GET    /api/packages           # List all packages
POST   /api/packages           # Create package
PUT    /api/packages/:id       # Update package
DELETE /api/packages/:id       # Delete package
PATCH  /api/packages/reorder   # Reorder packages
```

### Branding

```
GET    /api/branding           # Get branding settings
PUT    /api/branding           # Update branding
POST   /api/branding/apply     # Apply changes to site
```

### Applications

```
GET    /api/applications       # List applications
GET    /api/applications/:id   # Get single application
PUT    /api/applications/:id   # Update status/notes
DELETE /api/applications/:id   # Delete application
```

### Newsletter

```
GET    /api/subscribers        # List subscribers
POST   /api/subscribers        # Add subscriber
DELETE /api/subscribers/:id    # Remove subscriber
POST   /api/newsletter/send    # Send newsletter
```

### Messages

```
GET    /api/messages           # List messages
PUT    /api/messages/:id       # Mark as read/replied
DELETE /api/messages/:id       # Delete message
```

### File Upload

```
POST   /api/upload             # Upload file
DELETE /api/upload/:id         # Delete file
```

## Security Model

### Authentication Flow

```
1. User enters credentials
   ↓
2. NextAuth validates against database
   ↓
3. Password verified with bcrypt
   ↓
4. JWT token created
   ↓
5. Session stored in secure cookie
   ↓
6. Cookie sent with each request
   ↓
7. Middleware verifies token on protected routes
```

### Authorization Levels

**Admin** - Full access to everything
**Editor** - Can edit content but not publish
**Viewer** - Read-only access

### Protected Routes

All routes under `/dashboard/*` require authentication.

```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*']
};

export function middleware(request: NextRequest) {
  const session = getToken({ req: request });
  if (!session) {
    return NextResponse.redirect('/login');
  }
  return NextResponse.next();
}
```

### API Route Protection

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Proceed with authorized logic
}
```

## Publishing Mechanism

### How Content Updates Work

1. **Database Storage**: All content stored in JSONB format
2. **Version Control**: Previous versions kept in database
3. **Publishing**: Regex-based HTML manipulation
4. **Atomic Updates**: File writes are atomic
5. **Rollback**: Can revert to previous published version

### HTML Update Strategy

```typescript
async function updateSection(
  filePath: string,
  section: string,
  content: any
) {
  // Read current file
  let html = await fs.readFile(filePath, 'utf-8');

  // Find and replace specific section
  const sectionRegex = new RegExp(
    `<div class="${section}">.*?</div>`,
    'gs'
  );

  html = html.replace(
    sectionRegex,
    generateSectionHTML(section, content)
  );

  // Write atomically
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, html);
  await fs.rename(tempPath, filePath);
}
```

### Multi-File Updates

For sections that appear on multiple pages (footer, nav):

```typescript
async function updateGlobalSection(section: string, content: any) {
  const files = [
    'index.html',
    'about.html',
    'coaching.html',
    'contact.html',
    'system.html'
  ];

  await Promise.all(
    files.map(file =>
      updateSection(path.join(websitePath, file), section, content)
    )
  );
}
```

## State Management

### Client-Side State

**SWR** for data fetching:
- Automatic revalidation
- Cache management
- Optimistic updates

```typescript
import useSWR from 'swr';

function useContent(section: string) {
  const { data, error, mutate } = useSWR(
    `/api/content?section=${section}`,
    fetcher
  );

  return {
    content: data,
    isLoading: !error && !data,
    isError: error,
    update: mutate
  };
}
```

### Form State

**React Hook Form** + **Zod**:
- Type-safe forms
- Validation
- Error handling

```typescript
const schema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema)
});
```

## Performance Optimizations

### Server Components

Most pages use React Server Components for:
- Zero JavaScript to client
- Faster initial load
- Better SEO

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={logo}
  alt="Logo"
  width={200}
  height={50}
  priority // for above-fold images
/>
```

### Code Splitting

Automatic route-based code splitting by Next.js.

### Database Queries

Optimized with:
- Proper indexes
- Connection pooling
- Query result caching

## Extensibility

### Adding New Features

#### 1. New Content Section

```typescript
// 1. Add to database
await db.insert(content).values({
  section: 'team',
  data: { members: [] }
});

// 2. Create editor component
export function TeamEditor() {
  // Component logic
}

// 3. Add to content page
<TabsTrigger value="team">Team</TabsTrigger>
<TabsContent value="team">
  <TeamEditor />
</TabsContent>
```

#### 2. New Dashboard Page

```typescript
// app/(dashboard)/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" />
      {/* Content */}
    </div>
  );
}
```

#### 3. New API Endpoint

```typescript
// app/api/custom/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  // Logic
  return NextResponse.json(data);
}
```

## Monitoring & Logging

### Activity Logging

All actions logged to `activity_log` table:

```typescript
await logActivity({
  userId: session.user.id,
  action: 'content_updated',
  resource: 'hero',
  details: { changes: diff }
});
```

### Error Tracking

Production errors sent to Sentry:

```typescript
try {
  await dangerousOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## Backup & Recovery

### Automated Backups

Supabase provides:
- Daily automatic backups
- Point-in-time recovery
- 7-day retention (free tier)

### Manual Backup

```bash
# Backup database
supabase db dump > backup-$(date +%Y%m%d).sql

# Backup uploaded files
tar -czf files-backup.tar.gz public/uploads
```

### Recovery

```bash
# Restore database
supabase db restore < backup-20240210.sql

# Restore files
tar -xzf files-backup.tar.gz
```

## Testing Strategy

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { HeroEditor } from '@/components/editors/HeroEditor';

test('renders hero editor', () => {
  render(<HeroEditor />);
  expect(screen.getByText('Homepage Hero')).toBeInTheDocument();
});
```

### API Tests

```typescript
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/content/route';

test('GET /api/content returns content', async () => {
  await testApiHandler({
    handler,
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'GET' });
      expect(res.status).toBe(200);
    }
  });
});
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user created
- [ ] File upload service configured
- [ ] HTTPS enabled
- [ ] Error monitoring set up
- [ ] Backups configured
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled

## Maintenance

### Regular Tasks

**Daily**:
- Check error logs
- Monitor performance
- Review new applications

**Weekly**:
- Review analytics
- Test backup restoration
- Update dependencies

**Monthly**:
- Security audit
- Performance review
- Feature planning

## Future Enhancements

Potential features to add:

- [ ] Version control system (full content history)
- [ ] Multi-user collaboration
- [ ] Advanced role-based permissions
- [ ] A/B testing framework
- [ ] SEO optimization tools
- [ ] Email campaign builder
- [ ] Customer dashboard portal
- [ ] Mobile app
- [ ] AI-powered content suggestions
- [ ] Automated image optimization
- [ ] CDN integration
- [ ] GraphQL API
- [ ] Webhook system
- [ ] Plugin architecture

---

This architecture is designed to scale from a single admin to a team of content managers while maintaining security, performance, and ease of use.
