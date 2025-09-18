# Jenrate.Ai - AI-Powered Design Tool

## Overview
Jenrate.Ai is an AI-powered design platform that generates professional business documents and marketing materials from user prompts. It leverages AI, specifically OpenAI's GPT-4o, to create intelligent content for various templates, including pitch decks, CVs, brochures, charts, reports, and newsletters. The system incorporates sector-specific template variants that automatically detect industry keywords and apply specialized formatting for diverse business sectors. The platform aims to provide authentic, personalized content with real company details rather than generic placeholders. It features a React frontend, an Express.js backend, and a user dashboard with a 3-tier subscription model. Key capabilities include revolutionary AI prompt context application for personalized content, comprehensive template expansion for full-page documents, and live web data enhancement for factual accuracy.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application adopts a monorepo structure, clearly separating client, server, and shared code.

**Technical Stack:**
*   **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, shadcn/ui components (built on Radix UI), Tailwind CSS for styling, TanStack Query for state management, React Hook Form with Zod validation.
*   **Backend**: Express.js with TypeScript, RESTful API, Node.js runtime.
*   **Database**: PostgreSQL with Drizzle ORM.
*   **Authentication**: Session-based with email/password and OAuth support (Facebook, Google).
*   **AI Integration**: OpenAI GPT-4o for content generation.

**Core Features and Design Decisions:**
*   **Dynamic Template System**: Utilizes a comprehensive backend template library (36+ templates) stored in a PostgreSQL database, prioritizing database templates over static files. Templates cover invoices, newsletters, CVs, brochures, annual reports, and financial reports, with sector-specific variants.
*   **AI Content Generation**: Extracts and applies specific details from user prompts (company names, personnel, experience years, ratings, locations, business context) to generate personalized, "zero-fallback" content without generic placeholders. Includes comprehensive template expansion for full-page content and integrated AI chart/graph generation from data coordinates or CSV/Excel uploads.
*   **Live Web Data Integration**: Enhances AI document generation with real-time web information by fetching current data (company information, business metrics, industry trends, market statistics) using a web scraping API, integrating it into GPT-4o generation.
*   **HTML/JSON Primary Generation**: Documents are generated in HTML/JSON format first for editing, with PDF conversion available on-demand through download functionality.
*   **UI/UX Design**: Features a premium black and gold theme with professional branding, custom artisan-themed colors, and Playfair Display typography. It follows a mobile-first, responsive design approach with Tailwind breakpoints and ensures accessibility.
*   **Subscription Model**: Implemented a 3-tier pricing structure (Free, Starter, Pro, Agency) with usage tracking and plan limits. New users default to the Free plan.
*   **HTML/JSON Editing System**: Primary editing workflow uses HTML/JSON format for comprehensive inline text editing. PDF generation happens only when user requests download, ensuring optimal editing experience.
*   **Multi-Page Report System**: Generates professional 2-3 page business documents with proper page structure and comprehensive content, including executive summaries and detailed sections.
*   **Premium Logo Upload Feature**: Allows Pro and Agency subscribers to upload company logos for intelligent integration across all document types.
*   **Tier-Based Prompt Suggestions**: Provides personalized examples based on user's subscription tier.
*   **Single-Device Login Security**: Enforces single-device login restriction through session management to prevent account sharing.
*   **Revolutionary Template Thumbnail System**: Generates unique SVG-based visual previews for each database template using color hashing and category-specific layouts.
*   **Database Schema**: Manages Users, Subscription Plans, Templates, Documents, Transactions, Chat Sessions/Messages, Usage Analytics, and Notifications.
*   **Service Offerings**: Focuses on 7 core services: pitch decks, CVs/resumes, brochures, reports, invoices, newsletters, and financial reports. Chart/graph generation is now integrated as an AI-powered editor feature.

## External Dependencies

*   **Database Hosting**: Neon serverless PostgreSQL.
*   **AI Service**: OpenAI (GPT-4o API).
*   **Payment Gateway**: Stripe.
*   **Web Scraping**: Scraper API.
*   **PDF Generation API**: PDFShift API.
*   **Image Hosting**: Unsplash.
*   **Icons**: Lucide React and React Icons.
*   **Build Tools**: Vite (frontend), esbuild (backend).
*   **Validation**: Zod.