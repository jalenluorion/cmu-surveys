import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-full flex flex-col">

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Fair Survey Distribution
              <span className="block text-primary">for CMU Students</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete 10 surveys to unlock posting privileges. Help fellow students while ensuring everyone gets the responses they need.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/surveys"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Browse Surveys
            </Link>
            <Link 
              href="/leaderboard"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Leaderboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="text-2xl font-bold text-primary">10</div>
              <div className="text-sm text-muted-foreground">Surveys to unlock posting</div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="text-2xl font-bold text-primary">Fair</div>
              <div className="text-sm text-muted-foreground">Distribution algorithm</div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="text-2xl font-bold text-primary">Badges</div>
              <div className="text-sm text-muted-foreground">Earn recognition</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
