import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/integrations/supabase/client';
import { getJobRecommendations, saveRecommendations, getSavedRecommendations } from '@/lib/jobRecommendations';
import { Sparkles, MapPin, Briefcase, DollarSign, TrendingUp, Eye, X } from 'lucide-react';
import Link from 'next/link';

interface RecommendedJob {
  id: string;
  job_id: string;
  match_score: number;
  skills_match_score: number;
  experience_match_score: number;
  location_match_score: number;
  salary_match_score: number;
  match_details: any;
  viewed: boolean;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    salary_min: number;
    salary_max: number;
    salary_currency: string;
    created_at: string;
  };
}

export function RecommendedJobs() {
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Try to get saved recommendations first
      const saved = await getSavedRecommendations(user.id, false);
      
      if (saved.length > 0) {
        setRecommendations(saved);
      } else {
        // Generate new recommendations
        await generateRecommendations();
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateRecommendations() {
    try {
      setGenerating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const matches = await getJobRecommendations(user.id, 10, 50);
      
      if (matches.length === 0) {
        toast({
          title: 'No recommendations yet',
          description: 'Complete your profile to get personalized job recommendations.',
        });
        return;
      }

      // Save to database
      await saveRecommendations(user.id, matches);
      
      // Reload from database
      const saved = await getSavedRecommendations(user.id, false);
      setRecommendations(saved);

      toast({
        title: 'Recommendations updated',
        description: `Found ${matches.length} jobs that match your profile.`,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  }

  async function markAsViewed(recommendationId: string, jobId: string) {
    try {
      await supabase
        .from('job_recommendations')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .eq('id', recommendationId);
      
      // Update local state
      setRecommendations(prev =>
        prev.map(rec => rec.id === recommendationId ? { ...rec, viewed: true } : rec)
      );
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  }

  async function dismissRecommendation(recommendationId: string) {
    try {
      await supabase
        .from('job_recommendations')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', recommendationId);
      
      // Remove from local state
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));

      toast({
        title: 'Recommendation dismissed',
        description: 'This job will no longer appear in your recommendations.',
      });
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  }

  function getMatchColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  }

  function getMatchBadgeVariant(score: number): 'default' | 'secondary' | 'outline' {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Recommended Jobs
            </CardTitle>
            <CardDescription>
              Jobs matched to your profile and preferences
            </CardDescription>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {generating ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No recommendations yet</p>
            <p className="text-sm">Complete your profile to get personalized job matches</p>
            <Button
              onClick={generateRecommendations}
              className="mt-4"
              disabled={generating}
            >
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => dismissRecommendation(rec.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-start justify-between mb-3 pr-8">
                  <div className="flex-1">
                    <Link
                      href={`/jobs/${rec.job.id}`}
                      onClick={() => markAsViewed(rec.id, rec.job_id)}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-lg">{rec.job.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{rec.job.company}</p>
                  </div>
                  <Badge
                    variant={getMatchBadgeVariant(rec.match_score)}
                    className={getMatchColor(rec.match_score)}
                  >
                    {Math.round(rec.match_score)}% Match
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {rec.job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {rec.job.employment_type || 'Full-time'}
                  </div>
                  {rec.job.salary_min && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {rec.job.salary_currency} {rec.job.salary_min.toLocaleString()}
                      {rec.job.salary_max && ` - ${rec.job.salary_max.toLocaleString()}`}
                    </div>
                  )}
                </div>

                {/* Match breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Skills</span>
                    <span className={`font-semibold ${getMatchColor(rec.skills_match_score)}`}>
                      {Math.round(rec.skills_match_score)}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Experience</span>
                    <span className={`font-semibold ${getMatchColor(rec.experience_match_score)}`}>
                      {Math.round(rec.experience_match_score)}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Location</span>
                    <span className={`font-semibold ${getMatchColor(rec.location_match_score)}`}>
                      {Math.round(rec.location_match_score)}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Salary</span>
                    <span className={`font-semibold ${getMatchColor(rec.salary_match_score)}`}>
                      {Math.round(rec.salary_match_score)}%
                    </span>
                  </div>
                </div>

                {rec.match_details?.matchedSkills?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Matched Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.match_details.matchedSkills.slice(0, 5).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Link href={`/jobs/${rec.job.id}`} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => markAsViewed(rec.id, rec.job_id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Job
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
