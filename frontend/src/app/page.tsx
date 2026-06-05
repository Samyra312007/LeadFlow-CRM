'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const features = [
  {
    icon: 'account_tree',
    title: 'Pipeline Management',
    desc: 'Visualize and manage your entire sales pipeline with drag-free stage tracking and deal oversight.',
  },
  {
    icon: 'contacts',
    title: 'Contact Tracking',
    desc: 'Keep detailed records of every contact, from source to position, all in one place.',
  },
  {
    icon: 'assignment',
    title: 'Task Management',
    desc: 'Stay on top of your to-dos with priority-based task tracking and status updates.',
  },
  {
    icon: 'analytics',
    title: 'Analytics & Insights',
    desc: 'Make data-driven decisions with real-time stats on leads, deals, and conversions.',
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-headline-sm text-headline-sm font-black text-primary">LeadFlow CRM</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-label-md text-on-surface-variant hover:text-primary font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
          <h2 className="font-headline-lg text-5xl md:text-6xl text-primary font-black tracking-tight leading-tight">
            Manage Your Sales<br />
            <span className="text-on-surface-variant">Pipeline Like a Pro</span>
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-6 max-w-xl mx-auto leading-relaxed">
            LeadFlow CRM helps you track leads, manage contacts, close deals, and stay organized — all from a single, beautiful dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border border-outline-variant text-on-surface rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <span className="material-symbols-outlined text-3xl text-primary-fixed mb-4">{f.icon}</span>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2">{f.title}</h3>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-body-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} LeadFlow CRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
