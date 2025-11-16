// Database types for CMU Survey Exchange Platform

export interface SurveyUser {
  id: string;
  email: string;
  full_name?: string;
  surveys_completed: number;
  surveys_posted: number;
  weekly_surveys_completed: number;
  total_points: number;
  badges: string[];
  created_at: string;
  updated_at: string;
  last_weekly_reset: string;
}

export interface Survey {
  id: string;
  user_id: string;
  title: string;
  description: string;
  external_url: string;
  estimated_time_minutes: number;
  response_count: number;
  target_responses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: SurveyUser; // For joined queries
}

export interface SurveyCompletion {
  id: string;
  user_id: string;
  survey_id: string;
  completed_at: string;
  verified: boolean;
  survey?: Survey; // For joined queries
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge; // For joined queries
}

export interface WeeklyLeaderboard {
  id: string;
  user_id: string;
  week_start: string;
  surveys_completed: number;
  rank?: number;
  created_at: string;
  user?: SurveyUser; // For joined queries
}

export interface CreateSurveyData {
  title: string;
  description: string;
  external_url: string;
  estimated_time_minutes: number;
  target_responses?: number;
  existing_response_count?: number;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name?: string;
  email: string;
  surveys_completed: number;
  weekly_surveys_completed: number;
  total_points: number;
  badges: any[]; // Simplified for now to avoid complex nested typing
  rank: number;
}
