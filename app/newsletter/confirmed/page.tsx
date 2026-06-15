'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const already = status === 'already';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          {already ? 'Already Subscribed!' : 'Subscription Confirmed!'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {already
            ? 'You are already subscribed to our newsletter. Welcome back!'
            : 'Welcome! You are now subscribed to the CareerSasa newsletter. You will receive curated job opportunities, career tips, and industry updates.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Mail className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  );
}
