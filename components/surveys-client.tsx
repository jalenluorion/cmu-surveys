'use client';

import { useState, useEffect } from 'react';
import { Survey, SurveyUser } from '@/lib/types';
import { completeSurvey, getPlatformStats } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SurveysClientProps {
  user: any;
  surveyUser: SurveyUser | null;
  surveys: Survey[];
  completedSurveyIds: string[];
}

export default function SurveysClient({ 
  user, 
  surveyUser, 
  surveys, 
  completedSurveyIds 
}: SurveysClientProps) {
  const router = useRouter();
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set(completedSurveyIds));
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [totalSurveys, setTotalSurveys] = useState<number>(0);
  const [surveyClickTimes, setSurveyClickTimes] = useState<Map<string, number>>(new Map());

  // Check platform stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getPlatformStats();
        setTotalSurveys(stats.totalSurveys);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Determine if user can post based on survey count or completion requirement
  const canPostDueToLowSurveyCount = totalSurveys < 11;
  const canPostDueToCompletions = (surveyUser?.surveys_completed || 0) >= 10;
  const canPost = canPostDueToLowSurveyCount || canPostDueToCompletions;

  const handleTakeSurveyClick = (surveyId: string) => {
    setSurveyClickTimes(prev => new Map(prev.set(surveyId, Date.now())));
  };

  const handleCompleteSurvey = async (surveyId: string) => {
    if (!user) return;
    
    // Check if user clicked "Take Survey" and if 1 minute has passed
    const clickTime = surveyClickTimes.get(surveyId);
    if (!clickTime) {
      alert('Please click "Take Survey" first before marking as complete.');
      return;
    }
    
    const timeElapsed = Date.now() - clickTime;
    const oneMinuteInMs = 60 * 1000;
    
    if (timeElapsed < oneMinuteInMs) {
      const remainingSeconds = Math.ceil((oneMinuteInMs - timeElapsed) / 1000);
      alert(`Please wait ${remainingSeconds} more seconds before marking as complete.`);
      return;
    }
    
    setCompletingId(surveyId);
    try {
      await completeSurvey(user.id, surveyId);
      setCompletedSurveys(prev => new Set([...prev, surveyId]));
      // Remove the click time since survey is now completed
      setSurveyClickTimes(prev => {
        const newMap = new Map(prev);
        newMap.delete(surveyId);
        return newMap;
      });
      // Refresh the page to update response counts and user progress
      router.refresh();
    } catch (error) {
      console.error('Error completing survey:', error);
      alert(error instanceof Error ? error.message : 'Failed to mark survey as completed');
    } finally {
      setCompletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to view and complete surveys.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Survey Feed</h1>
              <p className="text-muted-foreground mt-1">
                Complete surveys to earn points and unlock posting privileges
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Your Progress</div>
              <div className="text-2xl font-bold">
                {surveyUser?.surveys_completed || 0}/10
              </div>
              <div className="text-sm text-muted-foreground">
                {canPost
                  ? 'Can post surveys!' 
                  : `${10 - (surveyUser?.surveys_completed || 0)} more to unlock posting`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              {surveys.length} Active Surveys
            </Badge>
            <Badge variant="outline">
              Sorted by Response Count (Lowest First)
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {canPost && (
              <Link href="/surveys/create">
                <Button>Post Your Survey</Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => router.refresh()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Surveys Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No surveys available</h3>
            <p className="text-muted-foreground">Check back later for new surveys to complete.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => {
              const isCompleted = completedSurveys.has(survey.id);
              const isOwnSurvey = survey.user_id === user?.id;
              const isCompleting = completingId === survey.id;

              return (
                <Card key={survey.id} className={`relative ${isCompleted ? 'opacity-75' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {survey.title}
                      </CardTitle>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">
                      {survey.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {survey.estimated_time_minutes} min
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {survey.response_count} responses
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        By: {survey.user?.full_name || survey.user?.email || 'Anonymous'}
                      </div>
                      
                      {survey.response_count < 10 && (
                        <Badge variant="secondary" className="text-xs">
                          Needs responses
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTakeSurveyClick(survey.id)}
                    >
                      <a
                        href={survey.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Take Survey
                      </a>
                    </Button>
                    
                    {!isCompleted && !isOwnSurvey && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteSurvey(survey.id)}
                        disabled={isCompleting}
                        className="flex-1"
                      >
                        {isCompleting ? 'Marking...' : 'Mark Complete'}
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Button size="sm" disabled className="flex-1">
                        Completed ✓
                      </Button>
                    )}
                    
                    {isOwnSurvey && (
                      <Button size="sm" disabled variant="secondary" className="flex-1">
                        Your Survey
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
