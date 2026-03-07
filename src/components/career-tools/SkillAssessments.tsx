'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  getSkillAssessments,
  getUserAssessmentResults,
  type SkillAssessment
} from '@/lib/careerTools';

export default function SkillAssessments() {
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [assessmentsData, resultsData] = await Promise.all([
        getSkillAssessments(),
        getUserAssessmentResults(user.id)
      ]);

      setAssessments(assessmentsData);
      setResults(resultsData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  const categories = ['all', 'technical', 'soft', 'language', 'tool'];
  const filteredAssessments = selectedCategory === 'all'
    ? assessments
    : assessments.filter(a => a.category === selectedCategory);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const hasCompletedAssessment = (assessmentId: string) => {
    return results.some(r => r.assessment_id === assessmentId);
  };

  const getAssessmentResult = (assessmentId: string) => {
    return results.find(r => r.assessment_id === assessmentId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Assessments</CardTitle>
          <CardDescription>
            Test your skills and earn certificates to showcase on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Available Assessments */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssessments.map(assessment => {
          const result = getAssessmentResult(assessment.id);
          const completed = hasCompletedAssessment(assessment.id);

          return (
            <Card key={assessment.id} className="relative">
              {completed && result?.passed && (
                <Badge className="absolute top-2 right-2" variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passed
                </Badge>
              )}
              {completed && !result?.passed && (
                <Badge className="absolute top-2 right-2" variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{assessment.skill_name}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {assessment.category}
                  </Badge>
                  <Badge className={getDifficultyColor(assessment.difficulty_level)}>
                    {assessment.difficulty_level}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {assessment.duration_minutes} min
                  </Badge>
                </div>

                {result && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score: {result.score}%</span>
                      <span>Pass: {assessment.passing_score}%</span>
                    </div>
                    <Progress value={result.score} />
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(result.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={completed ? 'outline' : 'default'}
                  onClick={() => {
                    toast({
                      title: 'Coming Soon',
                      description: 'Assessment interface will be available soon'
                    });
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {completed ? 'Retake Assessment' : 'Start Assessment'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* My Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Assessment Results</CardTitle>
            <CardDescription>
              Your completed assessments and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map(result => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                      {result.passed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {result.skill_assessments?.skill_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Score: {result.score}% • {new Date(result.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {result.passed && (
                      <Button size="sm" variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
