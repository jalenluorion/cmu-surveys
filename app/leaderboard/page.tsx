import { createClient } from '@/lib/supabase/server';
import { getServerLeaderboard, getServerAllBadges } from '@/lib/supabase/server-queries';
import LeaderboardClient from '@/components/leaderboard-client';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load leaderboard data in parallel
  const [weeklyLeaderboard, alltimeLeaderboard, badges] = await Promise.all([
    getServerLeaderboard('weekly', 50),
    getServerLeaderboard('alltime', 50),
    getServerAllBadges()
  ]);

  return (
    <LeaderboardClient 
      user={user}
      weeklyLeaderboard={weeklyLeaderboard}
      alltimeLeaderboard={alltimeLeaderboard}
      badges={badges}
    />
  );
}
