# Frontend Tooling Proposal - AI Climbing Coach

## Recommended Stack

### Core Framework: **Next.js 14** with App Router
**Why Next.js?**
- Server-side rendering for better SEO and initial load performance
- Built-in API routes (can use for BFF pattern if needed)
- Image optimization out of the box
- Excellent TypeScript support
- App Router provides modern React features (Server Components, Streaming)
- Easy deployment to AWS via Amplify or containerized on App Runner
- Built-in performance optimizations

**Alternative considered:** Vite + React
- Faster development builds
- But lacks SSR, image optimization, and other production features

### Styling: **Tailwind CSS v3**
- Utility-first approach (no inline styles needed)
- Great for rapid development
- Excellent responsive design utilities
- Dark mode support built-in
- Tree-shaking removes unused styles

### Component Library: **shadcn/ui**
**Why shadcn/ui?**
- Not a dependency - copies components into your codebase
- Built on Radix UI (accessible, unstyled components)
- Beautifully styled with Tailwind
- Fully customizable
- Components we'll use:
  - Dialog/Modal for forms
  - Card for journal entries
  - Button with variants
  - Input/Textarea for forms
  - Avatar for user profile
  - Tabs for navigation
  - Toast for notifications
  - Skeleton for loading states
  - Chart for progress visualization

### State Management: **Zustand** + **TanStack Query**
- **Zustand**: Simple state management for UI state, user preferences
- **TanStack Query**: Server state management, caching, synchronization
- Much simpler than Redux, perfect for this app's needs

### Form Handling: **React Hook Form** + **Zod**
- Type-safe form validation
- Excellent performance (minimal re-renders)
- Works great with TypeScript

### Authentication: **AWS Amplify Auth**
- Seamless integration with Cognito
- Pre-built UI components available
- Handles token management

### Additional Libraries

#### UI/UX
- **Framer Motion**: Smooth animations for chat UI
- **React Markdown**: Render AI responses with formatting
- **Recharts**: Data visualization for progress tracking
- **React Dropzone**: File uploads for training videos/photos

#### Development
- **TypeScript**: Type safety across the app
- **ESLint + Prettier**: Code quality and formatting
- **Husky + lint-staged**: Pre-commit hooks

#### Testing
- **Vitest**: Fast unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

## Project Structure

```
ai-climbing-coach/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth-required routes
│   │   ├── dashboard/
│   │   ├── journal/
│   │   ├── chat/
│   │   ├── training/
│   │   └── profile/
│   ├── (public)/            # Public routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── pricing/
│   ├── api/                 # API routes (if needed)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   ├── journal/
│   │   ├── JournalEntry.tsx
│   │   ├── JournalList.tsx
│   │   └── JournalForm.tsx
│   ├── dashboard/
│   │   ├── ProgressChart.tsx
│   │   ├── StatsCard.tsx
│   │   └── RecentActivity.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MobileNav.tsx
├── lib/
│   ├── api/                 # API client functions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── validators/          # Zod schemas
├── styles/
│   └── globals.css          # Tailwind imports
├── types/                   # TypeScript types
└── config/                  # App configuration

```

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev     # Start Next.js dev server
   npm run test    # Run tests
   npm run lint    # Lint code
   npm run build   # Production build
   ```

2. **Component Development**
   - Use Storybook for component isolation (optional)
   - Follow atomic design principles
   - All styles via Tailwind classes

3. **Code Style**
   - No inline styles unless absolutely necessary
   - Tailwind classes organized (layout, spacing, typography, colors)
   - Component files < 200 lines
   - Extract reusable logic to hooks

## Performance Considerations

1. **Bundle Size**
   - Dynamic imports for heavy components (charts, markdown editor)
   - Tree-shake unused Tailwind classes
   - Optimize images with Next.js Image component

2. **Runtime Performance**
   - Virtual scrolling for long journal lists
   - Debounce search inputs
   - Optimistic updates for better UX
   - React.memo for expensive components

3. **SEO & Accessibility**
   - Proper meta tags with Next.js Head
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation support

## Deployment

1. **AWS Amplify** (Recommended)
   - Git-based deployments
   - Preview deployments for PRs
   - Environment variables management
   - Custom domain support

2. **Alternative: Containerized**
   - Docker container on App Runner
   - More control but more setup

Would you like me to proceed with this stack? I can:
1. Set up the Next.js project with TypeScript and Tailwind
2. Install and configure shadcn/ui
3. Create the base component structure
4. Build the chat interface first

Let me know if you'd like any changes to the proposed stack!