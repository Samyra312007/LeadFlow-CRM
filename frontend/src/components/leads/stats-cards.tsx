'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { StatsData } from '@/constants/leadStatus';

interface StatsCardsProps {
  data: StatsData | undefined;
  isLoading: boolean;
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent>
              <div className="h-4 w-20 bg-surface-container-high rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-surface-container-high rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  const stats = [
    {
      label: 'Total Leads',
      value: data?.total ?? 0,
      icon: 'group',
      color: 'text-primary-fixed',
    },
    {
      label: 'Conversion Rate',
      value: data?.conversionRate ?? '0.00%',
      icon: 'trending_up',
      color: 'text-emerald-600',
    },
    {
      label: 'New Leads',
      value: data?.byStatus?.New ?? 0,
      icon: 'fiber_new',
      color: 'text-blue-600',
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                <p className="font-headline-lg text-headline-lg text-primary mt-1">{stat.value}</p>
              </div>
              <span className={`material-symbols-outlined text-3xl ${stat.color} opacity-60`}>{stat.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
