'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  getSalaryInsights,
  getUserSalaryExpectations,
  setSalaryExpectation,
  compareSalaryToMarket,
  type SalaryInsight
} from '@/lib/careerTools';

export default function SalaryInsights() {
  const [searchParams, setSearchParams] = useState({
    jobTitle: '',
    location: '',
    experienceLevel: ''
  });
  const [insights, setInsights] = useState<SalaryInsight | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [expectations, setExpectations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExpectations();
  }, []);

  async function loadExpectations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await getUserSalaryExpectations(user.id);
      setExpectations(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleSearch() {
    if (!searchParams.jobTitle) {
      toast({
        title: 'Required',
        description: 'Please enter a job title',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const data = await getSalaryInsights(
        searchParams.jobTitle,
        searchParams.location || undefined,
        searchParams.experienceLevel || undefined
      );

      setInsights(data);
      setComparison(null);

      if (!data) {
        toast({
          title: 'No Data',
          description: 'No salary data available for this search',
          variant: 'destructive'
        });
      }
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

  async function handleCompare(userSalary: number) {
    if (!insights || !searchParams.jobTitle) return;

    try {
      const comparisonData = await compareSalaryToMarket(
        searchParams.jobTitle,
        userSalary,
        searchParams.location || undefined,
        searchParams.experienceLevel || undefined
      );

      setComparison(comparisonData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleSaveExpectation(formData: FormData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await setSalaryExpectation({
        user_id: user.id,
        job_title: formData.get('job_title') as string,
        min_salary: parseInt(formData.get('min_salary') as string),
        max_salary: parseInt(formData.get('max_salary') as string),
        currency: formData.get('currency') as string || 'USD',
        is_negotiable: formData.get('is_negotiable') === 'true'
      });

      await loadExpectations();
      toast({
        title: 'Success',
        description: 'Salary expectation saved'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Insights</CardTitle>
          <CardDescription>
            Research market salaries for different roles and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Software Engineer"
                value={searchParams.jobTitle}
                onChange={(e) => setSearchParams({ ...searchParams, jobTitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={searchParams.experienceLevel}
                onValueChange={(value) => setSearchParams({ ...searchParams, experienceLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Search Salaries'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
            <CardDescription>
              Based on {insights.sample_size} data points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Minimum</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(insights.min_salary, insights.currency)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Median</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(insights.median_salary, insights.currency)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Maximum</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(insights.max_salary, insights.currency)}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Salary Range Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>25th Percentile</span>
                  <span className="font-semibold">
                    {formatCurrency(insights.percentile_25, insights.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>50th Percentile (Median)</span>
                  <span className="font-semibold">
                    {formatCurrency(insights.median_salary, insights.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>75th Percentile</span>
                  <span className="font-semibold">
                    {formatCurrency(insights.percentile_75, insights.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Compare Your Salary */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Compare Your Salary</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter your salary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCompare(parseInt((e.target as HTMLInputElement).value));
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    handleCompare(parseInt(input.value));
                  }}
                >
                  Compare
                </Button>
              </div>
            </div>

            {comparison && (
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Your Position</h4>
                  <Badge
                    variant={
                      comparison.status === 'above' ? 'default' :
                      comparison.status === 'below' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {comparison.status === 'above' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {comparison.status === 'below' && <TrendingDown className="h-3 w-3 mr-1" />}
                    {comparison.status === 'at' && <Minus className="h-3 w-3 mr-1" />}
                    {comparison.percentile}th Percentile
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your salary is {formatCurrency(Math.abs(comparison.difference), insights.currency)}
                  {' '}({Math.abs(comparison.differencePercentage)}%)
                  {' '}{comparison.status === 'above' ? 'above' : comparison.status === 'below' ? 'below' : 'at'}
                  {' '}the market median
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Salary Expectations */}
      <Card>
        <CardHeader>
          <CardTitle>My Salary Expectations</CardTitle>
          <CardDescription>
            Set your salary expectations for different roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSaveExpectation} className="space-y-4 mb-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="exp_job_title">Job Title</Label>
                <Input
                  id="exp_job_title"
                  name="job_title"
                  placeholder="e.g., Senior Developer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="min_salary">Min Salary</Label>
                <Input
                  id="min_salary"
                  name="min_salary"
                  type="number"
                  placeholder="100000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_salary">Max Salary</Label>
                <Input
                  id="max_salary"
                  name="max_salary"
                  type="number"
                  placeholder="150000"
                  required
                />
              </div>
            </div>
            <Button type="submit">Save Expectation</Button>
          </form>

          {expectations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Saved Expectations</h4>
              {expectations.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{exp.job_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(exp.min_salary, exp.currency)} - {formatCurrency(exp.max_salary, exp.currency)}
                    </p>
                  </div>
                  {exp.is_negotiable && (
                    <Badge variant="outline">Negotiable</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
