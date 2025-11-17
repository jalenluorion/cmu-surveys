// Supabase queries for CMU Survey Exchange Platform

import { createClient } from '@/lib/supabase/client';
import { SurveyUser, Survey, SurveyCompletion, CreateSurveyData, LeaderboardEntry, Badge, UserBadge } from '@/lib/types';

const supabase = createClient();

// User Management
export async function createOrUpdateUser(userId: string, email: string, fullName?: string): Promise<SurveyUser | null> {
  const { data, error } = await supabase
    .from('survey_users')
    .upsert({
      id: userId,
      email,
      full_name: fullName,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }

  return data;
}

export async function getUserProfile(userId: string): Promise<SurveyUser | null> {
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
export async function getSurveys(limit = 20, offset = 0): Promise<Survey[]> {
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

export async function createSurvey(userId: string, surveyData: CreateSurveyData): Promise<Survey | null> {
  // Get platform stats to check total survey count
  const stats = await getPlatformStats();
  
  // Get user profile for later use
  const userProfile = await getUserProfile(userId);
  if (!userProfile) {
    throw new Error('User profile not found');
  }
  
  // If there are fewer than 11 surveys, bypass the requirement
  if (stats.totalSurveys < 11) {
    // Allow posting without checking surveys_completed
  } else {
    // Check if user has completed enough surveys (normal requirement)
    if (userProfile.surveys_completed < 6) {
      throw new Error('You must complete 6 surveys before posting your own');
    }
  }

  const { data, error } = await supabase
    .from('survey_surveys')
    .insert({
      user_id: userId,
      title: surveyData.title,
      description: surveyData.description,
      external_url: surveyData.external_url,
      estimated_time_minutes: surveyData.estimated_time_minutes,
      response_count: surveyData.existing_response_count || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating survey:', error);
    throw error;
  }

  // Update user's surveys_posted count
  await supabase
    .from('survey_users')
    .update({ 
      surveys_posted: userProfile.surveys_posted + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  return data;
}

export async function getUserSurveys(userId: string): Promise<Survey[]> {
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
export async function completeSurvey(userId: string, surveyId: string): Promise<boolean> {
  // Check if user already completed this survey
  const { data: existing } = await supabase
    .from('survey_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('survey_id', surveyId)
    .single();

  if (existing) {
    throw new Error('You have already completed this survey');
  }

  // Check if user is trying to complete their own survey
  const { data: survey } = await supabase
    .from('survey_surveys')
    .select('user_id')
    .eq('id', surveyId)
    .single();

  if (survey?.user_id === userId) {
    throw new Error('You cannot complete your own survey');
  }

  const { error } = await supabase
    .from('survey_completions')
    .insert({
      user_id: userId,
      survey_id: surveyId,
    });

  if (error) {
    console.error('Error completing survey:', error);
    return false;
  }

  return true;
}

export async function getUserCompletions(userId: string): Promise<SurveyCompletion[]> {
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

export async function hasUserCompletedSurvey(userId: string, surveyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('survey_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('survey_id', surveyId)
    .single();

  return !error && !!data;
}

// Leaderboard
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
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
export async function getAllBadges(): Promise<Badge[]> {
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

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
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

// Statistics
export async function getPlatformStats() {
  const [usersResult, surveysResult, completionsResult] = await Promise.all([
    supabase.from('survey_users').select('id', { count: 'exact', head: true }),
    supabase.from('survey_surveys').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('survey_completions').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    totalSurveys: surveysResult.count || 0,
    totalCompletions: completionsResult.count || 0,
  };
}
