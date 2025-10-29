# AI Rules - YouTube Channel Watcher

## Tech Stack Overview

- **Frontend Framework**: React 19.1.1 with TypeScript
- **Styling**: Tailwind CSS 4.1.13 with custom animations and responsive design
- **Authentication**: Google OAuth 2.0 with custom Supabase user management
- **Database**: Supabase (PostgreSQL) for channels, videos, user data, and achievements
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks with custom contexts (AuthContext, etc.)
- **Form Handling**: React Hook Form with Zod validation (available but not heavily used)
- **Charts**: Recharts for data visualization (available but not heavily used)
- **Build Tool**: Vite 7.1.2 with React plugin
- **Package Management**: npm with ES modules

## Library Usage Rules

### ✅ MUST USE Libraries

1. **React + TypeScript**: All new components must be written in TypeScript with proper type definitions
2. **Tailwind CSS**: All styling must use Tailwind classes - no custom CSS unless absolutely necessary
3. **Lucide React**: Use for all icons - import individual icons to keep bundle size small
4. **Supabase**: All database operations must go through the existing `supabase.js` client
5. **Custom Hooks**: Use existing hooks (`useChannels`, `useVideos`, `useAchievements`) for data operations

### 🎯 Component Structure Rules

1. **File Organization**:
   - Pages go in `src/pages/`
   - Components go in `src/components/`
   - Hooks go in `src/hooks/`
   - Contexts go in `src/contexts/`
   - Utilities go in `src/utils/`

2. **Component Creation**:
   - Each component must be in its own file
   - Use functional components with TypeScript
   - Include proper JSDoc comments for complex components
   - Follow the existing naming convention (PascalCase for components)

3. **Styling Guidelines**:
   - Use Tailwind utility classes exclusively
   - Follow the existing color scheme (YouTube red: #FF0000)
   - Ensure responsive design (mobile-first approach)
   - Use existing animation classes from `index.css`

### 🔐 Authentication Rules

1. **User Management**:
   - Use `useAuth()` hook for all authentication needs
   - User data is stored in Supabase `users` table with `active` flag
   - All database operations must filter by `user_id`

2. **Session Handling**:
   - Use localStorage for session persistence
   - Follow the existing OAuth flow pattern
   - Handle token expiration gracefully

### 📊 Data Management Rules

1. **Database Operations**:
   - All Supabase queries must include `user_id` filter
   - Use optimistic updates where appropriate
   - Handle loading states consistently
   - Implement proper error handling

2. **State Management**:
   - Use React hooks for local state
   - Leverage existing custom hooks for data fetching
   - Avoid prop drilling - use context when needed

### 🎮 Gamification Rules

1. **Achievements System**:
   - Use the existing `useAchievements` hook
   - Follow the established achievement types and triggers
   - Use the `Celebration` component for achievement notifications

2. **User Progress**:
   - Track channel additions and video watches
   - Implement progress-based achievements
   - Use the existing badge system

### 🔍 Search & Filtering Rules

1. **Video Search**:
   - Use the existing keyword-based search system
   - Implement channel filtering through the sidebar
   - Maintain search state properly

2. **Performance**:
   - Implement debounced search where appropriate
   - Use efficient database queries
   - Cache results when possible

### 🛠️ Development Rules

1. **Code Quality**:
   - Use TypeScript strictly
   - Follow ESLint configuration
   - Write clean, readable code
   - Use meaningful variable names

2. **Error Handling**:
   - Implement proper error boundaries
   - Show user-friendly error messages
   - Log errors to console for debugging

3. **Testing**:
   - Write tests for new utilities
   - Test component interactions
   - Verify database operations

### 📱 UI/UX Rules

1. **Consistency**:
   - Follow the existing design patterns
   - Use consistent spacing and typography
   - Maintain the YouTube-inspired color scheme

2. **Accessibility**:
   - Use semantic HTML
   - Include proper ARIA labels
   - Ensure keyboard navigation works
   - Maintain sufficient color contrast

3. **Responsive Design**:
   - Mobile-first approach
   - Test on different screen sizes
   - Use responsive Tailwind classes

### 🔄 Update & Maintenance Rules

1. **Adding New Features**:
   - Follow the existing architecture
   - Update documentation when adding new components
   - Maintain backward compatibility

2. **Dependencies**:
   - Avoid adding new dependencies unless absolutely necessary
   - Keep existing dependencies updated
   - Review bundle size impact

## File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` or `camelCase.js`
- Utilities: `camelCase.ts`
- Pages: `PascalCase.tsx`
- Contexts: `PascalCase.tsx`

## Important Notes

- This app uses a custom authentication system built on top of Supabase
- All user data is isolated by `user_id`
- The achievement system is tightly integrated with user actions
- The search system supports keywords, titles, and channel names
- Mobile responsiveness is critical for all new features