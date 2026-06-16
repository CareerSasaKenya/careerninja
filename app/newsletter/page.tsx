'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, Briefcase, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to subscribe');
        return;
      }

      if (data.already_subscribed) {
        toast.info(data.message);
      } else {
        toast.success(data.message || 'Check your email to confirm your subscription!');
        setSubmitted(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            The Jobs You Miss Yesterday Are in Your Inbox Tomorrow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Kenyan professionals who get first access to new jobs, salary insights, and free career tools — because early applicants get 4x more interview callbacks.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Briefcase className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Jobs Before Anyone Else</h3>
              <p className="text-sm text-muted-foreground">
                Get new jobs in your inbox before they appear on the site — be the first to apply because early applicants get hired
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Free Salary Guides & CV Templates</h3>
              <p className="text-sm text-muted-foreground">
                Exclusive downloads you won't find anywhere else — including Kenya's salary benchmarks by industry and role
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">What Employers Actually Want</h3>
              <p className="text-sm text-muted-foreground">
                Insider insights from Kenyan hiring managers — the advice that gets you shortlisted, not the generic tips everyone shares
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscribe Form */}
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Hired Faster — It's Free</CardTitle>
            <CardDescription>
              No spam. No fluff. Just jobs, tools, and insights that actually help you land interviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Check Your Inbox!</h3>
                <p className="text-muted-foreground">
                  We sent a confirmation email to <strong>{email}</strong>.
                  Click the link in the email to complete your subscription.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletter-email">Email Address *</Label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe Now'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By subscribing, you agree to receive marketing emails from CareerSasa.
                  You can unsubscribe at any time.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
