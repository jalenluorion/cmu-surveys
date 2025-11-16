<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Authentication Setup

The platform uses Supabase Auth. Configure your authentication providers in the Supabase dashboard under Authentication > Providers.

## Usage Flow

1. **Sign Up/Login**: Users authenticate via Supabase Auth
2. **Complete Surveys**: Browse and complete surveys to earn points
3. **Track Progress**: View progress toward 10-survey posting requirement
4. **Post Survey**: Once eligible, post surveys with external links
5. **Leaderboard**: Compete on weekly and all-time leaderboards
6. **Earn Badges**: Unlock recognition badges for participation

## Key Components

### Survey Feed (`/surveys`)
- Lists active surveys ranked by response count
- Shows completion status and prevents duplicate completions
- Tracks user progress toward posting privileges

### Survey Creation (`/surveys/create`)
- Enforces 10-survey completion requirement
- Validates survey data and external URLs
- Integrates with existing response counts

### Leaderboard (`/leaderboard`)
- Weekly and all-time rankings
- Badge showcase and user achievements
- Real-time ranking updates

### Profile Dashboard (`/profile`)
- Personal stats and progress tracking
- Survey completion history
- Badge collection display

## Database Policies

Row Level Security (RLS) is enabled with policies ensuring:
- Users can only edit their own profiles
- Survey posting requires 10+ completions
- Completion tracking prevents duplicates
- Public access to leaderboards and surveys

## Cleanup

When the platform is no longer needed, easily remove all data:

```sql
-- Drop all tables with SURVEY_ prefix
DROP TABLE IF EXISTS SURVEY_weekly_leaderboard CASCADE;
DROP TABLE IF EXISTS SURVEY_user_badges CASCADE;
DROP TABLE IF EXISTS SURVEY_badges CASCADE;
DROP TABLE IF EXISTS SURVEY_completions CASCADE;
DROP TABLE IF EXISTS SURVEY_surveys CASCADE;
DROP TABLE IF EXISTS SURVEY_users CASCADE;
```

## Development

### Project Structure
```
├── app/                    # Next.js app router pages
│   ├── surveys/           # Survey feed and creation
│   ├── leaderboard/       # Rankings and badges
│   └── profile/           # User dashboard
├── components/            # Reusable UI components
├── lib/                   # Utilities and database queries
│   ├── contexts/          # React contexts
│   ├── supabase/          # Database queries
│   └── types.ts           # TypeScript definitions
└── supabase/
    └── migrations/        # Database schema
```

### Adding Features

1. Update database schema in migrations
2. Add TypeScript types in `lib/types.ts`
3. Create database queries in `lib/supabase/queries.ts`
4. Build UI components and pages

## Contributing

This platform was built specifically for CMU's survey distribution needs. Feel free to adapt it for other educational institutions or survey exchange use cases.
