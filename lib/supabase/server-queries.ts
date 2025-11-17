// Server-side Supabase queries for CMU Survey Exchange Platform

import { createClient } from '@/lib/supabase/server';
import { SurveyUser, Survey, SurveyCompletion, LeaderboardEntry, Badge, UserBadge } from '@/lib/types';

// User Management
export async function createOrUpdateServerUser(userId: string, email: string, fullName?: string): Promise<SurveyUser | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_users')
    .upsert({
      id: userId,
      email,
      full_name: fullName || email.split('@')[0],
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }

  return data;
}

export async function getServerUserProfile(userId: string): Promise<SurveyUser | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Survey Management
export async function getServerSurveys(limit = 20, offset = 0): Promise<Survey[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_surveys')
    .select(`
      *,
      user:survey_users(id, email, full_name)
    `)
    .eq('is_active', true)
    .order('response_count', { ascending: true }) // Lowest responses first for fairness
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching surveys:', error);
    return [];
  }

  return data || [];
}

export async function getServerUserSurveys(userId: string): Promise<Survey[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_surveys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user surveys:', error);
    return [];
  }

  return data || [];
}

// Survey Completion
export async function getServerUserCompletions(userId: string): Promise<SurveyCompletion[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_completions')
    .select(`
      *,
      survey:survey_surveys(*)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching user completions:', error);
    return [];
  }

  return data || [];
}

export async function getServerUserCompletedSurveyIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_completions')
    .select('survey_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user completions:', error);
    return [];
  }

  return (data || []).map(completion => completion.survey_id);
}

// Leaderboard
export async function getServerLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const orderColumn = 'surveys_completed';
  
  const { data, error } = await supabase
    .from('survey_users')
    .select(`
      id,
      email,
      full_name,
      surveys_completed,
      survey_user_badges(
        id,
        earned_at,
        badge:survey_badges(*)
      )
    `)
    .order(orderColumn, { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return (data || []).map((user, index) => ({
    user_id: user.id,
    full_name: user.full_name,
    email: user.email,
    surveys_completed: user.surveys_completed,
    badges: user.survey_user_badges || [],
    rank: index + 1,
  }));
}

// Badges
export async function getServerAllBadges(): Promise<Badge[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_badges')
    .select('*')
    .order('requirement_value', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

export async function getServerUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_user_badges')
    .select(`
      *,
      badge:survey_badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return data || [];
}
