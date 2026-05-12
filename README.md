# Startup Kano Innovation Hub - Portfolio Management System

A comprehensive task management and team collaboration platform built with Next.js 16, React 19, TypeScript, and Supabase.

## 🚀 Features

- **Task Management**: Create, assign, and track tasks with priority levels
- **User Authentication**: Secure login/signup with offline fallback
- **Role-based Access**: Admin and Member roles with different permissions
- **Real-time Updates**: Live notifications and task status updates
- **Offline Support**: Graceful degradation when network is unavailable
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.6, React 19.2.3, TypeScript
- **Styling**: Tailwind CSS 4.2.1
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd startup-kano-portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL migrations in your Supabase SQL editor:
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/migrations/002_rls_policies.sql`
   - Execute `supabase/migrations/003_auth_trigger.sql`

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 👥 Default Users (Offline Mode)

When the application detects no internet connection, it automatically switches to offline mode with these test accounts:

- **Admin**: `admin@startupkano.com` / `admin123`
- **Member**: `user@startupkano.com` / `user123`

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `full_name` (VARCHAR)
- `phone_number` (VARCHAR, Optional)
- `role` (VARCHAR: 'admin' | 'member')
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

### Tasks Table
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `type` (VARCHAR: 'personal' | 'assigned')
- `status` (VARCHAR: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'acknowledged' | 'revision_requested')
- `priority` (VARCHAR: 'low' | 'medium' | 'high' | 'urgent')
- `assigned_to` (UUID, Foreign Key)
- `assigned_by` (UUID, Foreign Key)
- `is_personal` (BOOLEAN)
- `accepted_at`, `completed_at`, `acknowledged_at` (TIMESTAMP)
- `revision_notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

## 🔐 User Roles & Permissions

### Admin Permissions
- ✅ Create and assign tasks to users
- ✅ Review and acknowledge completed tasks
- ✅ Request task revisions with feedback
- ✅ Manage user accounts
- ✅ Send system-wide notifications
- ✅ Access admin dashboard

### Member Permissions
- ✅ View personal dashboard
- ✅ Accept assigned tasks
- ✅ Create personal tasks
- ✅ Mark tasks as complete
- ✅ Submit weekly reports
- ❌ Access admin functions

## 🔄 Task Lifecycle

```
Created (Admin) → Assigned → Pending → Accepted → In Progress → Completed → Reviewed (Admin) → Acknowledged/Revision Requested
```

## 📱 Pages & Routes

- `/` - Home (redirects to dashboard or login)
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin dashboard (admin only)

## 🎨 UI Components

The application includes a custom component library:
- `Button` - Customizable button with variants and loading states
- `Input` - Form input with label and error handling
- `Card` - Content container with header, content, and footer
- `Modal` - Overlay dialog for forms and details
- `TaskCard` - Specialized card for displaying task information
- `StatsCard` - Dashboard statistics display

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure session management
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Input sanitization and output encoding

## 🛠️ Troubleshooting

### Common Issues

1. **"Profile fetch error"**: Run the auth trigger migration
2. **Offline mode not working**: Check network connectivity
3. **Tasks not loading**: Verify Supabase configuration
4. **Build errors**: Ensure all dependencies are installed

### Debug Mode

Set `NODE_ENV=development` to enable detailed error logging.

## 📈 Future Enhancements

- [ ] File upload system for task attachments
- [ ] Advanced analytics and reporting
- [ ] Mobile application (React Native)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Advanced user management
- [ ] Audit logging
- [ ] API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

Built with ❤️ for Startup Kano Innovation Hub