-- CMU Survey Exchange Platform Database Schema
-- All tables and policies prefixed with SURVEY_ for easy cleanup

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table to track survey participation
CREATE TABLE IF NOT EXISTS SURVEY_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  surveys_completed INTEGER DEFAULT 0,
  surveys_posted INTEGER DEFAULT 0,
  weekly_surveys_completed INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_weekly_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys table to store posted surveys
CREATE TABLE IF NOT EXISTS SURVEY_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES SURVEY_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  external_url TEXT NOT NULL,
  estimated_time_minutes INTEGER NOT NULL,
  response_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey completions tracking
CREATE TABLE IF NOT EXISTS SURVEY_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES SURVEY_users(id) ON DELETE CASCADE,
  survey_id UUID REFERENCES SURVEY_surveys(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  UNIQUE(user_id, survey_id)
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS SURVEY_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  requirement_type TEXT NOT NULL, -- 'surveys_completed', 'surveys_posted', etc.
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS SURVEY_user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES SURVEY_users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES SURVEY_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Weekly leaderboard snapshots
CREATE TABLE IF NOT EXISTS SURVEY_weekly_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES SURVEY_users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  surveys_completed INTEGER NOT NULL,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable Row Level Security
ALTER TABLE SURVEY_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE SURVEY_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE SURVEY_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE SURVEY_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE SURVEY_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE SURVEY_weekly_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SURVEY_users
CREATE POLICY "Users can view all profiles" ON SURVEY_users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON SURVEY_users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON SURVEY_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for SURVEY_surveys
CREATE POLICY "Anyone can view active surveys" ON SURVEY_surveys
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert surveys if they have completed 10+" ON SURVEY_surveys
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM SURVEY_users 
      WHERE surveys_completed >= 10
    )
  );

CREATE POLICY "Users can update own surveys" ON SURVEY_surveys
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for SURVEY_completions
CREATE POLICY "Users can view own completions" ON SURVEY_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON SURVEY_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Survey owners can view completions of their surveys" ON SURVEY_completions
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM SURVEY_surveys WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for SURVEY_badges
CREATE POLICY "Anyone can view badges" ON SURVEY_badges
  FOR SELECT USING (true);

-- RLS Policies for SURVEY_user_badges
CREATE POLICY "Anyone can view user badges" ON SURVEY_user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can insert user badges" ON SURVEY_user_badges
  FOR INSERT WITH CHECK (true);

-- RLS Policies for SURVEY_weekly_leaderboard
CREATE POLICY "Anyone can view weekly leaderboard" ON SURVEY_weekly_leaderboard
  FOR SELECT USING (true);

-- Functions and Triggers

-- Function to update user stats when survey is completed
CREATE OR REPLACE FUNCTION update_user_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's survey completion count
  UPDATE SURVEY_users 
  SET 
    surveys_completed = surveys_completed + 1,
    weekly_surveys_completed = weekly_surveys_completed + 1,
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

-- Trigger for survey completion
CREATE TRIGGER trigger_update_user_stats_on_completion
  AFTER INSERT ON SURVEY_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_completion();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge_record RECORD;
BEGIN
  -- Check for badges based on surveys completed
  FOR badge_record IN 
    SELECT * FROM SURVEY_badges 
    WHERE requirement_type = 'surveys_completed' 
    AND requirement_value <= NEW.surveys_completed
  LOOP
    -- Insert badge if not already earned
    INSERT INTO SURVEY_user_badges (user_id, badge_id)
    VALUES (NEW.id, badge_record.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for badge awarding
CREATE TRIGGER trigger_check_and_award_badges
  AFTER UPDATE ON SURVEY_users
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

-- Function to reset weekly stats
CREATE OR REPLACE FUNCTION reset_weekly_stats()
RETURNS void AS $$
BEGIN
  -- Archive current week's data
  INSERT INTO SURVEY_weekly_leaderboard (user_id, week_start, surveys_completed, rank)
  SELECT 
    id,
    date_trunc('week', NOW() - INTERVAL '1 week')::date,
    weekly_surveys_completed,
    ROW_NUMBER() OVER (ORDER BY weekly_surveys_completed DESC)
  FROM SURVEY_users
  WHERE weekly_surveys_completed > 0;
  
  -- Reset weekly counters
  UPDATE SURVEY_users 
  SET 
    weekly_surveys_completed = 0,
    last_weekly_reset = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default badges
INSERT INTO SURVEY_badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('Bronze Researcher', 'Complete 20 surveys', '🥉', 'surveys_completed', 20),
  ('Silver Contributor', 'Complete 50 surveys', '🥈', 'surveys_completed', 50),
  ('Gold Participator', 'Complete 100 surveys', '🥇', 'surveys_completed', 100),
  ('Survey Starter', 'Complete your first survey', '🌟', 'surveys_completed', 1),
  ('Perfect Ten', 'Complete 10 surveys to unlock posting', '🔟', 'surveys_completed', 10)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_users_surveys_completed ON SURVEY_users(surveys_completed);
CREATE INDEX IF NOT EXISTS idx_survey_users_weekly_completed ON SURVEY_users(weekly_surveys_completed);
CREATE INDEX IF NOT EXISTS idx_survey_surveys_response_count ON SURVEY_surveys(response_count);
CREATE INDEX IF NOT EXISTS idx_survey_surveys_active ON SURVEY_surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_completions_user_survey ON SURVEY_completions(user_id, survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_completed_at ON SURVEY_completions(completed_at);
