import { Helmet } from "react-helmet";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Bell, Mail, Briefcase, MapPin } from "lucide-react";

export default function JobAlerts() {
  const [formData, setFormData] = useState({
    email: "",
    keywords: "",
    location: "",
    jobType: "",
    frequency: "daily",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Job alert created! You'll receive notifications based on your preferences.");
    setFormData({ email: "", keywords: "", location: "", jobType: "", frequency: "daily" });
  };

  return (
    <>
      <Helmet>
        <title>Job Alerts - Never Miss an Opportunity | CareerSasa</title>
        <meta name="description" content="Create personalized job alerts on CareerSasa and get notified instantly when new opportunities matching your criteria are posted. Stay ahead in your job search." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <MobileNav />
        
        <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Job Alerts
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Stay Ahead - Get Notified About New Opportunities Instantly
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Alert Setup Form */}
              <section className="bg-card border border-border rounded-lg p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Create Job Alert</h2>
                  <p className="text-muted-foreground">Set up personalized alerts and never miss the perfect opportunity.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Job Keywords</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="e.g. Software Developer, Marketing Manager"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Nairobi, Mombasa"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                      <SelectTrigger id="jobType">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Alert Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant (as jobs are posted)</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      I agree to receive job alerts via email
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Create Alert
                  </Button>
                </form>
              </section>

              {/* Information Section */}
              <section className="space-y-6">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-primary">Why Use Job Alerts?</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Be the First to Apply</h3>
                        <p className="text-sm text-muted-foreground">Get notified immediately when jobs matching your criteria are posted.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Save Time</h3>
                        <p className="text-sm text-muted-foreground">No need to constantly check the website. Jobs come to you.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Personalized Results</h3>
                        <p className="text-sm text-muted-foreground">Only receive alerts for jobs that match your specific requirements.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">4</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Flexible Preferences</h3>
                        <p className="text-sm text-muted-foreground">Update or pause your alerts anytime from your dashboard.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold text-primary">How It Works</h3>
                  <ol className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary">1.</span>
                      <span>Fill out the form with your job preferences</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary">2.</span>
                      <span>Choose how often you want to receive alerts</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary">3.</span>
                      <span>Confirm your email address</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary">4.</span>
                      <span>Start receiving personalized job notifications</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <h3 className="text-xl font-bold text-primary">Manage Your Alerts</h3>
                  <p className="text-muted-foreground">
                    Already have an account? Log in to your dashboard to view, edit, or delete your existing job alerts. You can create multiple alerts for different job types and locations.
                  </p>
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
