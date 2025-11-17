-- Migration to simplify points system and remove target_responses and weekly leaderboard
-- This migration removes the total_points, target_responses, and weekly-related fields

-- Remove total_points column from SURVEY_users table
ALTER TABLE SURVEY_users DROP COLUMN IF EXISTS total_points;

-- Remove target_responses column from SURVEY_surveys table  
ALTER TABLE SURVEY_surveys DROP COLUMN IF EXISTS target_responses;

-- Remove weekly-related columns from SURVEY_users table
ALTER TABLE SURVEY_users DROP COLUMN IF EXISTS weekly_surveys_completed;
ALTER TABLE SURVEY_users DROP COLUMN IF EXISTS last_weekly_reset;

-- Drop the weekly leaderboard table entirely
DROP TABLE IF EXISTS SURVEY_weekly_leaderboard;

-- Update the trigger function to remove points calculation and weekly tracking
CREATE OR REPLACE FUNCTION update_user_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's survey completion count
  UPDATE SURVEY_users 
  SET 
    surveys_completed = surveys_completed + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update survey response count
  UPDATE SURVEY_surveys 
  SET 
    response_count = response_count + 1,
    updated_at = NOW()
  WHERE id = NEW.survey_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update indexes (remove any that referenced total_points)
DROP INDEX IF EXISTS idx_survey_users_total_points;
DROP INDEX IF EXISTS idx_survey_surveys_target_responses;
