import { createClient } from '@/lib/supabase/server';
import { getServerLeaderboard, getServerAllBadges } from '@/lib/supabase/server-queries';
import LeaderboardClient from '@/components/leaderboard-client';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load leaderboard data
  const [leaderboard, badges] = await Promise.all([
    getServerLeaderboard(50),
    getServerAllBadges()
  ]);

  return (
    <LeaderboardClient 
      user={user}
      leaderboard={leaderboard}
      badges={badges}
    />
  );
}
