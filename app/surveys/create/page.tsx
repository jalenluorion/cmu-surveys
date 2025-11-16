import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerUserProfile } from '@/lib/supabase/server-queries';
import CreateSurveyClient from '@/components/create-survey-client';

export default async function CreateSurveyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const surveyUser = await getServerUserProfile(user.id);

  if (!surveyUser) {
    redirect('/');
  }

  return <CreateSurveyClient user={user} surveyUser={surveyUser} />;
}
