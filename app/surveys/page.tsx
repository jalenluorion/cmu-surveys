import { createClient } from '@/lib/supabase/server';
import { getServerSurveys, getServerUserProfile, getServerUserCompletedSurveyIds } from '@/lib/supabase/server-queries';
import SurveysClient from '@/components/surveys-client';

export default async function SurveysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load surveys data
  const surveys = await getServerSurveys(50);
  
  // Load user-specific data if authenticated
  let surveyUser = null;
  let completedSurveyIds: string[] = [];
  
  if (user) {
    [surveyUser, completedSurveyIds] = await Promise.all([
      getServerUserProfile(user.id),
      getServerUserCompletedSurveyIds(user.id)
    ]);
  }

  return (
    <SurveysClient 
      user={user}
      surveyUser={surveyUser}
      surveys={surveys}
      completedSurveyIds={completedSurveyIds}
    />
  );
}
