# Sheva-Setu

A production-ready full-stack government services portal built with Next.js, Supabase, and AI-powered document reading.

## Features
- Email-based registration and login
- Email verification flow
- Supabase auth integration
- AI document authenticity checks
- Auto-fill user forms from uploaded documents
- Hindi + English bilingual support
- Government officer dashboard with approval/rejection workflow
- Application tracking and document review

## Tech stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI

## Quick start
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase and OpenAI keys
3. Run: `npm install`
4. Start app: `npm run dev`

## Supabase setup
Apply the SQL from `supabase/schema.sql` in your Supabase SQL editor.

## Notes
This project is designed to work with real Supabase and OpenAI credentials. Without them, the app still loads and can run in demo mode for local UI testing.
