'use client';

import { useState } from 'react';
import { Survey, SurveyCompletion, UserBadge, SurveyUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Trophy, FileText, CheckCircle, Clock, Users, ExternalLink, Award } from 'lucide-react';
import Link from 'next/link';

interface ProfileClientProps {
  user: any;
  surveyUser: SurveyUser;
  userSurveys: Survey[];
  completions: SurveyCompletion[];
  badges: UserBadge[];
}

export default function ProfileClient({ 
  user, 
  surveyUser, 
  userSurveys, 
  completions, 
  badges 
}: ProfileClientProps) {
  const canPostSurveys = (surveyUser?.surveys_completed || 0) >= 10;
  const progressPercentage = Math.min(((surveyUser?.surveys_completed || 0) / 10) * 100, 100);

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {surveyUser?.full_name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{surveyUser?.surveys_completed || 0}</div>
                  <div className="text-sm text-muted-foreground">Surveys Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{surveyUser?.surveys_posted || 0}</div>
                  <div className="text-sm text-muted-foreground">Surveys Posted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{badges.length}</div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Survey Posting Progress</CardTitle>
            <CardDescription>
              Complete 10 surveys to unlock the ability to post your own surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {surveyUser?.surveys_completed || 0} / 10 surveys completed
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                {canPostSurveys ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Can post surveys
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    {10 - (surveyUser?.surveys_completed || 0)} more surveys needed
                  </Badge>
                )}
                {canPostSurveys && (
                  <Link href="/surveys/create">
                    <Button size="sm">Post Survey</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        {badges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Badges
              </CardTitle>
              <CardDescription>
                Recognition for your survey participation achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((userBadge) => (
                  <div key={userBadge.id} className="text-center p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="text-2xl mb-2">
                      {userBadge.badge?.icon || '⭐'}
                    </div>
                    <div className="font-semibold text-sm">
                      {userBadge.badge?.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {userBadge.badge?.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Tabs */}
        <Tabs defaultValue="completed" className="space-y-6">
          <TabsList>
            <TabsTrigger value="completed">Completed Surveys</TabsTrigger>
            <TabsTrigger value="posted">Posted Surveys</TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Surveys</CardTitle>
                <CardDescription>
                  Surveys you've completed to earn points and progress toward posting privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No surveys completed yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start completing surveys to earn points and unlock posting privileges.
                    </p>
                    <Link href="/surveys">
                      <Button>Browse Surveys</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completions.map((completion) => (
                      <div key={completion.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{completion.survey?.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {completion.survey?.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {completion.survey?.estimated_time_minutes} min
                            </span>
                            <span>
                              Completed {new Date(completion.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">+10 points</Badge>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posted">
            <Card>
              <CardHeader>
                <CardTitle>Posted Surveys</CardTitle>
                <CardDescription>
                  Surveys you've posted for the CMU community to complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userSurveys.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No surveys posted yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {canPostSurveys 
                        ? "You can now post surveys! Share your research with the community."
                        : `Complete ${10 - (surveyUser?.surveys_completed || 0)} more surveys to unlock posting privileges.`
                      }
                    </p>
                    {canPostSurveys ? (
                      <Link href="/surveys/create">
                        <Button>Post Your First Survey</Button>
                      </Link>
                    ) : (
                      <Link href="/surveys">
                        <Button>Complete More Surveys</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userSurveys.map((survey) => (
                      <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{survey.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {survey.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {survey.estimated_time_minutes} min
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {survey.response_count} responses
                            </span>
                            <span>
                              Posted {new Date(survey.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={survey.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Badge 
                            variant={survey.is_active ? "default" : "secondary"}
                          >
                            {survey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
