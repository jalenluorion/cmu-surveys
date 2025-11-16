import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerUserProfile, getServerUserSurveys, getServerUserCompletions, getServerUserBadges } from '@/lib/supabase/server-queries';
import ProfileClient from '@/components/profile-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Load all user data in parallel
  const [surveyUser, userSurveys, completions, badges] = await Promise.all([
    getServerUserProfile(user.id),
    getServerUserSurveys(user.id),
    getServerUserCompletions(user.id),
    getServerUserBadges(user.id)
  ]);

  if (!surveyUser) {
    redirect('/');
  }

  return (
    <ProfileClient 
      user={user}
      surveyUser={surveyUser}
      userSurveys={userSurveys}
      completions={completions}
      badges={badges}
    />
  );
}
