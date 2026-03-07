'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Target, Clock, DollarSign, CheckCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  suggestCareerPaths,
  getUserCareerGoals,
  createCareerGoal,
  updateCareerGoal,
  type CareerGoal
} from '@/lib/careerTools';

export default function CareerPathPlanner() {
  const [suggestedPaths, setSuggestedPaths] = useState<any[]>([]);
  const [myGoals, setMyGoals] = useState<any[]>([]);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [pathsData, goalsData] = await Promise.all([
        suggestCareerPaths(user.id),
        getUserCareerGoals(user.id)
      ]);

      setSuggestedPaths(pathsData || []);
      setMyGoals(goalsData);
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

  async function handleCreateGoal(formData: FormData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const goal = await createCareerGoal({
        user_id: user.id,
        user_current_role: formData.get('current_role') as string,
        target_role: formData.get('target_role') as string,
        target_timeline_months: parseInt(formData.get('timeline') as string),
        notes: formData.get('notes') as string,
        is_active: true
      });

      setMyGoals([goal, ...myGoals]);
      setIsCreatingGoal(false);
      toast({
        title: 'Success',
        description: 'Career goal created successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleUpdateProgress(goalId: string, progress: number) {
    try {
      await updateCareerGoal(goalId, { progress_percentage: progress });
      setMyGoals(myGoals.map(g => g.id === goalId ? { ...g, progress_percentage: progress } : g));
      toast({
        title: 'Progress Updated',
        description: 'Your career goal progress has been updated'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'challenging': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* My Career Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Career Goals</CardTitle>
              <CardDescription>
                Track your progress towards your career objectives
              </CardDescription>
            </div>
            <Dialog open={isCreatingGoal} onOpenChange={setIsCreatingGoal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Career Goal</DialogTitle>
                  <DialogDescription>
                    Set a new career objective to track
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateGoal} className="space-y-4">
                  <div>
                    <Label htmlFor="current_role">Current Role</Label>
                    <Input
                      id="current_role"
                      name="current_role"
                      placeholder="e.g., Junior Developer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_role">Target Role</Label>
                    <Input
                      id="target_role"
                      name="target_role"
                      placeholder="e.g., Senior Developer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline (months)</Label>
                    <Input
                      id="timeline"
                      name="timeline"
                      type="number"
                      placeholder="24"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any additional notes or milestones..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreatingGoal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Goal</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {myGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No career goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Set your first career goal to start planning your path
              </p>
              <Button onClick={() => setIsCreatingGoal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myGoals.filter(g => g.is_active).map(goal => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {goal.user_current_role} → {goal.target_role}
                        </CardTitle>
                        <CardDescription>
                          {goal.target_timeline_months} months timeline
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {goal.progress_percentage}% Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={goal.progress_percentage} />
                    
                    {goal.career_paths && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Recommended Steps:</h4>
                        {goal.career_paths.steps?.steps?.map((step: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{step.title}</p>
                              <p className="text-muted-foreground text-xs">
                                {step.duration_months} months • {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {goal.notes && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-semibold">Notes:</p>
                        <p>{goal.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress_percentage + 10))}
                      >
                        Update Progress
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCareerGoal(goal.id, { is_active: false }).then(loadData)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Career Paths */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Career Paths</CardTitle>
          <CardDescription>
            Based on your profile and current role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestedPaths.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Complete your profile to get personalized career path suggestions
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {suggestedPaths.map((path, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {path.from_role} → {path.to_role}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                      {path.match_score > 0 && (
                        <Badge variant="outline">
                          {path.match_score}% Match
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{path.duration_months} months typical duration</span>
                    </div>
                    {path.salary_increase_percentage && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>+{path.salary_increase_percentage}% salary increase</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Pre-fill the create goal dialog
                        setIsCreatingGoal(true);
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Set as Goal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
