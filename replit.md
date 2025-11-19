# Ruvab IT - Advanced Technology Solutions Website

## Overview
This project is a full-stack web application for Ruvab IT, showcasing AI-powered products (Trend Solver, LangScribe, RevenueAI, FYPPAL, QR Gen Tool, and AgeHealthy). It focuses on promoting partnerships and collaboration with innovative founders in AI Implementation, Process Automation, Business Intelligence, Cloud Solutions, and Cybersecurity. The site offers consultation, promotional support, and partnership opportunities to accelerate growth and innovation.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 22, 2025)
- **Google AdSense 2025 E-E-A-T Compliance**: Completely redesigned blog generation system to meet Google AdSense 2025 standards with E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) requirements
  - **Long-Form Content**: 1000-2000 word articles (minimum 1000 enforced, target 1200-1500) meeting AdSense 2025 minimum requirements
  - **E-E-A-T Framework**: AI positioned as "globally recognized technology expert with 20+ years of hands-on industry experience"
  - **Experience**: First-hand scenarios, practical insights from real projects, hands-on implementation examples
  - **Expertise**: Deep technical mastery, industry-specific terminology, frameworks, methodologies, data-driven insights
  - **Authoritativeness**: Definitive guides, comprehensive coverage, confident presentation, industry standards
  - **Trustworthiness**: Accurate verifiable information, balanced perspectives, transparency, specific real data
  - **Automated Quality Validation (2025)**: Strict enforcement of 1000+ words, 5-7 H2 sections, 15+ substantive paragraphs
  - **Content Structure**: Long-form articles with 5-7 well-developed sections, 3-4 paragraph introduction/conclusion
  - **Writing Quality**: Expert-level authoritative voice, professional tone, specific examples/data, comprehensive coverage
  - **Comprehensive Documentation**: Updated docs/GOOGLE_ADSENSE_COMPLIANCE.md with full 2025 E-E-A-T compliance guidelines
  - See compliance documentation for complete AdSense 2025 quality requirements and E-E-A-T implementation details
  
- **Automated Image Generation**: DALL-E integration for professional blog and news article headers
  - **Blog Images**: All automated blog posts now include AI-generated featured images (1792x1024, professional tech aesthetic)
  - **News Images**: Tech news summaries include contextual header images with gradient color scheme (blue, purple, cyan)
  - **Database Schema**: Added featuredImage field to blogPosts and ai_news_summaries tables
  - **Image Script**: Created server/generate-blog-images.ts to retroactively generate images for existing posts
  - Professional, consistent branding across all automated content

- **Blog Content Rendering Fix (October 22, 2025)**:
  - **Issue**: Blog posts were displaying as plain text without headings or proper formatting
  - **Root Cause**: AI was generating numbered lists instead of markdown; HTML sanitization was collapsing whitespace and deleting entities
  - **Solution Implemented**:
    - Updated AI prompts to enforce markdown format (## for H2, ### for H3) with explicit examples
    - Created stripHtmlPreserveMarkdown() function that strips HTML but preserves markdown structure
    - Decodes 23+ common HTML entities (em dashes, smart quotes, ellipses, symbols, currency) plus numeric entities
    - Preserves newlines and paragraph breaks for proper document structure
  - **Result**: Blog posts now render with proper headings, formatting, and decoded special characters
  - **Note**: Existing blog posts need regeneration to benefit from this fix; new posts will render correctly automatically

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query for server state.
- **Build Tool**: Vite.
- **UI/UX Decisions**: Responsive, mobile-first design with a vibrant minimalist aesthetic, gradient backgrounds, enhanced hero sections, backdrop blur effects, smooth animations, borderless cards with gradient shadows, rounded badges, and interactive elements. Uses a cohesive blue-purple-cyan color scheme.

### Backend
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Session Management**: PostgreSQL-based sessions with `connect-pg-simple`.
- **API**: RESTful endpoints (`/api` prefix), with middleware for logging, error handling, and session-based authentication.
- **Security**: Enterprise-level security including API key security, bcrypt password hashing, comprehensive security headers, enhanced session configuration with CSRF protection, secure cookies, httpOnly flags, PII data protection with data masking, multi-layer access controls, audit logging, HTTPS enforcement, rate limiting, and secure error responses.

### Core Features
- **Product Showcase**: Dedicated pages for Trend Solver, LangScribe, FYPPAL, QR Gen Tool, AgeHealthy, and RevenueAI.
- **Partnership Platform**: Transformed services section to focus on collaboration opportunities with founders. Includes call-to-action sections, solution submission forms, and consultation scheduling.
- **Content Management**:
    - **Blog Management**: Full CRUD operations for blog posts (admin system) with AI-powered generation (GPT-4o), automated image generation (DALL-E), and HTML tag stripping.
    - **Content Publishing Webhook**: Secure API endpoint (`POST /api/v1/content/publish`) for automated content publishing from external applications with HMAC authentication, idempotency, async processing, HTML sanitization, and callback notifications.
    - **CMS**: Admin interface for managing page content (hero, about, services) via JSON configuration, navigation, component settings, and blog management.
- **AI-Powered Chat Support**: OpenAI-integrated customer support with intelligent caching, auto-FAQ generation, and robust security features to block dangerous queries.
- **User Engagement**: Onboarding, real-time notification system, user profile management, and testimonials.
- **Payment & Monetization**: Razorpay payment gateway with international tax compliance, Buy Me a Coffee integration, and Google AdSense display advertising.
- **SEO & Analytics**: Google Analytics, meta tags, Open Graph, Twitter Cards, structured data, lazy loading, code splitting, and optimized images.
- **Compliance**: GDPR-compliant cookie consent management, Privacy Policy, and Terms of Service pages.
- **Technology News System**: Comprehensive news fetching from multiple sources with 24/7 availability, intelligent 12-hour caching, detailed article summaries, and professional images.
- **Referral Partner System**: Comprehensive affiliate marketing system with an admin interface.
- **Free Tools System**: Public tools page with a webhook submission endpoint for admin-only HTML/CSS/JS tool uploads.

## External Dependencies

### Third-Party Services
- **Google Analytics**: User behavior tracking.
- **Google AdSense**: Display advertising and revenue generation.
- **Neon Database**: Serverless PostgreSQL hosting.
- **RapidAPI NewsNow**: News API service.
- **NewsAPI.ai (EventRegistry.org)**: News API provider.
- **OpenAI**: AI-powered content generation and chat support.
- **DALL-E**: AI-powered image generation.
- **Razorpay**: Payment gateway.

### Production Dependencies
- **connect-pg-simple**: PostgreSQL-based session management.
- **Helmet**: Security headers.
- **Gzip compression**: Performance optimization.
- **sanitize-html**: XSS protection.
- **uuid**: Unique ID generation.