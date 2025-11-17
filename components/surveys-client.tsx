'use client';

import { useState, useEffect } from 'react';
import { Survey, SurveyUser } from '@/lib/types';
import { completeSurvey, getPlatformStats } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Users, CheckCircle, X } from 'lucide-react';
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
  const [activeModalSurvey, setActiveModalSurvey] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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

  // Countdown timer effect for modal
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Determine if user can post based on survey count or completion requirement
  const canPostDueToLowSurveyCount = totalSurveys < 11;
  const canPostDueToCompletions = (surveyUser?.surveys_completed || 0) >= 6;
  const canPost = canPostDueToLowSurveyCount || canPostDueToCompletions;

  const handleTakeSurveyClick = (surveyId: string, surveyUrl: string) => {
    setSurveyClickTimes(prev => new Map(prev.set(surveyId, Date.now())));
    setActiveModalSurvey(surveyId);
    setTimeRemaining(60); // 60 seconds
    
    // Open survey in new tab
    window.open(surveyUrl, '_blank');
  };

  const closeModal = () => {
    setActiveModalSurvey(null);
    setTimeRemaining(0);
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
                {surveyUser?.surveys_completed || 0}/6
              </div>
              <div className="text-sm text-muted-foreground">
                {canPost
                  ? 'Can post surveys!' 
                  : `${6 - (surveyUser?.surveys_completed || 0)} more to unlock posting`
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
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTakeSurveyClick(survey.id, survey.external_url)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Take Survey
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

      {/* Survey Completion Modal */}
      {activeModalSurvey && (() => {
        const modalSurvey = surveys.find(s => s.id === activeModalSurvey);
        const isOwnSurvey = modalSurvey?.user_id === user?.id;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Completed the survey?</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Mark the survey as complete once you&apos;ve finished filling it out.
              </p>
              
              {isOwnSurvey && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This is your own survey.
                  </p>
                </div>
              )}
              
              {timeRemaining > 0 && !isOwnSurvey && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please wait {timeRemaining} seconds before marking as complete.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleCompleteSurvey(activeModalSurvey);
                    closeModal();
                  }}
                  disabled={timeRemaining > 0 || completingId === activeModalSurvey || isOwnSurvey}
                  className="flex-1"
                >
                  {completingId === activeModalSurvey ? 'Marking...' : 'Mark Complete'}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
