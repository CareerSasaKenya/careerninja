'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Award, TrendingUp, DollarSign } from 'lucide-react';
import CVBuilder from '@/components/career-tools/CVBuilder';
import CoverLetterGenerator from '@/components/career-tools/CoverLetterGenerator';
import SkillAssessments from '@/components/career-tools/SkillAssessments';
import CareerPathPlanner from '@/components/career-tools/CareerPathPlanner';
import SalaryInsights from '@/components/career-tools/SalaryInsights';

export default function CareerToolsPage() {
  const [activeTab, setActiveTab] = useState('cv-builder');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Career Tools</h1>
        <p className="text-muted-foreground">
          Professional tools to accelerate your career growth
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="cv-builder" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">CV Builder</span>
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Cover Letters</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="career-path" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Career Path</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Salary</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cv-builder" className="space-y-4">
          <CVBuilder />
        </TabsContent>

        <TabsContent value="cover-letter" className="space-y-4">
          <CoverLetterGenerator />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <SkillAssessments />
        </TabsContent>

        <TabsContent value="career-path" className="space-y-4">
          <CareerPathPlanner />
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <SalaryInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}
