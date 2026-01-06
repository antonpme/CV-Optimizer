---
applyTo: '**'
---
# CV Optimizer - Coding Guidelines

## Project Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI API

## Code Style
- Use functional components with TypeScript
- Prefer Server Actions over API routes where possible
- Use Zod for validation
- Follow existing shadcn/ui patterns for components

## File Organization
- `src/app/` - Pages and layouts (App Router)
- `src/app/actions/` - Server actions
- `src/components/` - Reusable UI components
- `src/lib/` - Utilities and shared logic
- `src/types/` - TypeScript types
- `supabase/` - Database schema and policies

## Documentation
- `docs/permanent/` - Architectural docs
- `docs/sessions/` - Session handoffs
- Update `docs/permanent/tasks.md` when completing tasks
