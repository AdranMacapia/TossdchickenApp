# Toss D' Chicken — Project Instructions

## Session Start Rule
Read HANDOFF.md at the start of every session before doing anything. It contains current project status, what was done last session, and what to do next.

## Context Limit Rule
When the conversation context reaches approximately 70–80% capacity:
1. Stop all active work immediately.
2. Update HANDOFF.md — "What Was Done Last Session" and "What To Do Next" sections.
3. Note any files that are partially written or half-done.
4. Tell the user: "Context is getting full — I've updated HANDOFF.md. Please clear the session and start a new one."
5. Do not continue building. Wait for the user to clear context.

## Project Basics
- App: Point-of-sale + costing + inventory system for a fried chicken business
- Stack: React + Vite + TypeScript + Tailwind, Supabase (free), Vercel (free)
- PWA — one codebase for web and mobile home screen install
- Currency: Philippine Peso (₱)
- Roles: owner (full access), cashier (POS only)
- No VAT now — toggle in settings later

## Coding Standards
- TypeScript strict mode
- Tailwind for all styling — no external component libraries unless necessary
- Supabase client lives in `src/lib/supabase.ts`
- All cost math lives in `src/lib/costing.ts` (pure functions, no side effects)
- Keep pages thin — business logic in lib/ or hooks/
- No comments unless the why is non-obvious
