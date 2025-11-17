'use client';

import { LeaderboardEntry, Badge } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

interface LeaderboardClientProps {
  user: any;
  leaderboard: LeaderboardEntry[];
  badges: Badge[];
}

export default function LeaderboardClient({ 
  user, 
  leaderboard, 
  badges 
}: LeaderboardClientProps) {

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getUserRank = () => {
    if (!user) return null;
    return leaderboard.find(entry => entry.user_id === user.id);
  };

  const userRank = getUserRank();

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground mt-1">
              See who&apos;s leading in survey participation and earn recognition for your contributions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User's Current Rank */}
        {user && userRank && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Current Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                    {getRankIcon(userRank.rank)}
                  </div>
                  <div>
                    <div className="font-semibold">Rank #{userRank.rank}</div>
                    <div className="text-sm text-muted-foreground">
                      {userRank.surveys_completed} surveys completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userRank.surveys_completed}</div>
                  <div className="text-sm text-muted-foreground">Total Surveys</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              The top contributors to the CMU survey exchange community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardTable entries={leaderboard} />
          </CardContent>
        </Card>

        {/* Badge Showcase */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Available Badges
            </CardTitle>
            <CardDescription>
              Complete surveys to earn these recognition badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">{badge.icon || '⭐'}</div>
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <div className="text-xs text-muted-foreground">{badge.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No rankings yet</h3>
        <p className="text-muted-foreground">Be the first to complete surveys and appear on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.user_id}
          className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
            entry.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-secondary/5' : ''
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10">
              {getRankIcon(entry.rank)}
            </div>
            <div>
              <div className="font-semibold">
                {entry.full_name || entry.email.split('@')[0]}
              </div>
              <div className="text-sm text-muted-foreground">
                {entry.surveys_completed} surveys completed
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Badges */}
            <div className="flex space-x-1">
              {entry.badges.slice(0, 3).map((badge: any, badgeIndex: number) => (
                <BadgeComponent key={badgeIndex} variant="secondary" className="text-xs">
                  {badge.badge?.icon || '⭐'}
                </BadgeComponent>
              ))}
              {entry.badges.length > 3 && (
                <BadgeComponent variant="outline" className="text-xs">
                  +{entry.badges.length - 3}
                </BadgeComponent>
              )}
            </div>
            
            {/* Surveys */}
            <div className="text-right">
              <div className="font-bold">{entry.surveys_completed}</div>
              <div className="text-xs text-muted-foreground">surveys</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
