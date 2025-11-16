'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSurvey } from '@/lib/supabase/queries';
import { CreateSurveyData, SurveyUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CreateSurveyClientProps {
  user: any;
  surveyUser: SurveyUser;
}

export default function CreateSurveyClient({ user, surveyUser }: CreateSurveyClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateSurveyData>({
    title: '',
    description: '',
    external_url: '',
    estimated_time_minutes: 5,
    target_responses: 50,
    existing_response_count: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canPost = (surveyUser?.surveys_completed || 0) >= 10;
  const remainingSurveys = Math.max(0, 10 - (surveyUser?.surveys_completed || 0));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.external_url.trim()) {
      newErrors.external_url = 'Survey URL is required';
    } else {
      try {
        new URL(formData.external_url);
      } catch {
        newErrors.external_url = 'Please enter a valid URL';
      }
    }

    if (formData.estimated_time_minutes < 1 || formData.estimated_time_minutes > 60) {
      newErrors.estimated_time_minutes = 'Time must be between 1 and 60 minutes';
    }

    if (formData.target_responses && (formData.target_responses < 1 || formData.target_responses > 500)) {
      newErrors.target_responses = 'Target responses must be between 1 and 500';
    }

    if (formData.existing_response_count && formData.existing_response_count < 0) {
      newErrors.existing_response_count = 'Existing responses cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !canPost) return;
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createSurvey(user.id, formData);
      router.push('/surveys?posted=true');
    } catch (error) {
      console.error('Error creating survey:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create survey' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateSurveyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/surveys">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Surveys
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Post Your Survey</h1>
              <p className="text-muted-foreground mt-1">
                Share your survey with the CMU community
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Eligibility Check */}
        {!canPost && (
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800 dark:text-orange-200">
                  Complete More Surveys to Unlock Posting
                </CardTitle>
              </div>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                You need to complete {remainingSurveys} more survey{remainingSurveys !== 1 ? 's' : ''} before you can post your own.
                This ensures fair participation in the survey exchange.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Progress</div>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {surveyUser?.surveys_completed || 0}/10
                  </div>
                </div>
                <Link href="/surveys">
                  <Button>Complete Surveys</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {canPost && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">
                  You&apos;re Eligible to Post!
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-300">
                You&apos;ve completed {surveyUser?.surveys_completed} surveys and can now post your own.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Survey Form */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>
              Provide information about your survey to help other students decide whether to participate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Student Study Habits Survey"
                  disabled={!canPost}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Briefly describe what your survey is about and why responses are valuable..."
                  rows={4}
                  disabled={!canPost}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* External URL */}
              <div className="space-y-2">
                <Label htmlFor="external_url">Survey Link *</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => handleInputChange('external_url', e.target.value)}
                  placeholder="https://forms.google.com/..."
                  disabled={!canPost}
                  className={errors.external_url ? 'border-red-500' : ''}
                />
                {errors.external_url && (
                  <p className="text-sm text-red-500">{errors.external_url}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Link to your Google Form, Qualtrics survey, or other survey platform
                </p>
              </div>

              {/* Time and Response Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Estimated Time (minutes) *</Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.estimated_time_minutes}
                    onChange={(e) => handleInputChange('estimated_time_minutes', parseInt(e.target.value) || 0)}
                    disabled={!canPost}
                    className={errors.estimated_time_minutes ? 'border-red-500' : ''}
                  />
                  {errors.estimated_time_minutes && (
                    <p className="text-sm text-red-500">{errors.estimated_time_minutes}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_responses">Target Responses</Label>
                  <Input
                    id="target_responses"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.target_responses}
                    onChange={(e) => handleInputChange('target_responses', parseInt(e.target.value) || 0)}
                    disabled={!canPost}
                    className={errors.target_responses ? 'border-red-500' : ''}
                  />
                  {errors.target_responses && (
                    <p className="text-sm text-red-500">{errors.target_responses}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existing_responses">Existing Responses</Label>
                  <Input
                    id="existing_responses"
                    type="number"
                    min="0"
                    value={formData.existing_response_count}
                    onChange={(e) => handleInputChange('existing_response_count', parseInt(e.target.value) || 0)}
                    disabled={!canPost}
                    className={errors.existing_response_count ? 'border-red-500' : ''}
                  />
                  {errors.existing_response_count && (
                    <p className="text-sm text-red-500">{errors.existing_response_count}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    If you already have responses
                  </p>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/surveys">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!canPost || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Survey'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
