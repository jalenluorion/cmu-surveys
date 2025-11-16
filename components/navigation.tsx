import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-foreground">
              CMU Survey Exchange
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/surveys" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Survey Feed
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Leaderboard
              </Link>
              <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
