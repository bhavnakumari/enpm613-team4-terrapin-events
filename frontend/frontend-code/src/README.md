# UMD Student Event Management System

A comprehensive event management platform for University of Maryland students with full dark mode support.

## 🎯 Features Implemented

### ✅ Landing Page (UMD Theme)
- **Route:** `/`
- Hero section with campus imagery
- Feature highlights
- Statistics showcase
- Upcoming events preview
- Call-to-action sections
- Full UMD branding (red #E21833)

### ✅ Events Catalog Page
- **Route:** `/events`
- Browse all campus events
- Search functionality
- Category filtering (Academic, Social, Sports, Workshop, Cultural, Career)
- RSVP/Registration system
- Event cards with capacity tracking
- Personal registrations section

### ✅ Event Details Page
- Modal-based event details view
- Complete event information
- Registration capabilities
- Capacity indicators
- Organizer information

### ✅ Event Management Page
- Integrated within Events Catalog
- Toggle RSVP status
- View registered events
- Event statistics

### ✅ Create Event Wizard (7 Steps)
- **Route:** `/create-event`
- **Step 1:** Basic Information (title, description, category, organizer)
- **Step 2:** Date & Time selection
- **Step 3:** Location details
- **Step 4:** Pricing & capacity
- **Step 5:** Media upload (images, videos)
- **Step 6:** Event settings (approval, waitlist, reminders)
- **Step 7:** Review & submit
- Progress indicator
- Form validation
- Save draft functionality

### ✅ Admin Approval Page
- **Route:** `/admin`
- Event submission dashboard
- Pending/Approved/Rejected tabs
- Review and approval workflow
- Rejection reason system
- Statistics overview
- Search and filter capabilities

### ✅ User Profile & Registrations Page
- **Route:** `/profile`
- User information display
- Registered events overview
- Upcoming vs. past events tabs
- Ticket management
- Download tickets
- Cancel registration
- Statistics (total events, RSVPs, attendance)

### ✅ Payment / Checkout Page
- **Route:** `/payment`
- Credit card payment form
- PayPal integration option
- Billing information
- Order summary sidebar
- Terms and conditions
- Secure payment indicators

### ✅ Registration Confirmation Page
- **Route:** `/registration-confirmation`
- Success confirmation
- Ticket number display
- Event details recap
- Payment summary
- Download/Email ticket options
- Next steps guidance

### ✅ Analytics Dashboard Page
- **Route:** `/analytics`
- Key metrics (events, registrations, revenue, views)
- Registration trend charts
- Event category distribution
- Performance comparison
- Conversion metrics
- Popular venues analysis
- Time period filtering
- Export capabilities

### ✅ Dark Mode Support
- Full dark mode implementation
- Theme toggle in header
- Persistent theme preference
- All pages support dark mode
- Proper contrast ratios
- UMD red adapted for dark mode (#C11528)

## 🎨 Design System

### Colors
- **Primary:** #E21833 (UMD Red)
- **Primary Dark Mode:** #C11528
- **Categories:**
  - Academic: Blue (#3B82F6)
  - Social: Purple (#8B5CF6)
  - Sports: Green (#10B981)
  - Workshop: Orange (#F59E0B)
  - Cultural: Pink (#EC4899)
  - Career: Red (matches UMD brand)

### Typography
- Consistent heading hierarchy
- UMD-style uppercase labels
- Proper font weights and sizes
- Accessible text contrast

## 🗂️ Project Structure

```
/
├── components/
│   ├── Layout.tsx              # Main layout with header/footer
│   ├── EventCard.tsx           # Event card component
│   ├── AddEventDialog.tsx      # Quick add event modal
│   ├── EventDetailsDialog.tsx  # Event details modal
│   └── ui/                     # Shadcn UI components
├── contexts/
│   └── ThemeContext.tsx        # Dark mode context
├── pages/
│   ├── LandingPage.tsx
│   ├── EventsCatalogPage.tsx
│   ├── CreateEventWizard.tsx
│   ├── AdminApprovalPage.tsx
│   ├── UserProfilePage.tsx
│   ├── PaymentPage.tsx
│   ├── RegistrationConfirmationPage.tsx
│   └── AnalyticsDashboard.tsx
├── types/
│   └── index.ts                # TypeScript interfaces
└── App.tsx                     # Main routing
```

## 🚀 Navigation

### Main Navigation
- **Home** - Landing page
- **Events Catalog** - Browse all events
- **Create Event** - 7-step wizard
- **Analytics** - Performance dashboard
- **Admin** - Approval system

### User Menu (Dropdown)
- Profile & Registrations
- My Analytics
- Settings
- Log out

### Footer Links
- About, Contact, FAQ
- Event guidelines
- Help center, Safety, Terms
- Social media links

## 🔧 Key Features

### Search & Filter
- Real-time search across events
- Category-based filtering
- Combined search + filter

### RSVP System
- One-click registration
- Capacity tracking
- Waitlist support
- Registration confirmation

### Admin Features
- Event approval workflow
- Bulk actions
- Performance metrics
- User management

### Analytics
- Real-time statistics
- Visual charts (recharts)
- Conversion tracking
- Revenue analytics

### Dark Mode
- System preference detection
- Manual toggle
- Persistent storage
- Smooth transitions

## 📱 Responsive Design
- Mobile-first approach
- Tablet breakpoints
- Desktop optimization
- Touch-friendly interactions

## 🎯 User Flows

### Student Registration Flow
1. Browse events → Event Catalog
2. View details → Event Details Modal
3. Click RSVP → Payment Page (if paid)
4. Complete payment → Confirmation Page
5. View ticket → Profile Page

### Event Creation Flow
1. Click "Create Event" → Step 1: Basic Info
2. Fill 7 steps with validation
3. Review summary → Submit
4. Admin approval (if required)
5. Event goes live

### Admin Approval Flow
1. Navigate to Admin page
2. Review pending events
3. Approve or reject with notes
4. Event status updates
5. Organizer notified

## 🌙 Dark Mode Implementation
- Uses CSS custom properties
- Theme context with React
- LocalStorage persistence
- Automatic system preference detection
- Toggle in top navigation bar

## 🎨 UMD Branding
- Official red color (#E21833)
- "ADELE H. STAMP STUDENT UNION" branding
- "CENTER FOR CAMPUS LIFE" subtitle
- Consistent typography
- Campus imagery

## 📊 Data Flow
- Mock data for demonstration
- Ready for Supabase integration
- Type-safe interfaces
- State management with React hooks

## 🔐 Security Considerations
- Form validation
- Input sanitization
- Secure payment flow
- Admin role checks
- Protected routes

## 🚀 Future Enhancements
- Real-time notifications
- Email integrations
- Calendar sync
- Social sharing
- Event recommendations
- Advanced analytics
- Mobile app

---

Built with React, TypeScript, Tailwind CSS, and Shadcn UI
