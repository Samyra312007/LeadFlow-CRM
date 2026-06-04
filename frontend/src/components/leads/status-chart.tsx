'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { STATUS_ORDER, LEAD_STATUS } from '@/constants/leadStatus';
import type { StatsData } from '@/constants/leadStatus';

const CHART_COLORS: Record<string, string> = {
  [LEAD_STATUS.NEW]: '#3b82f6',
  [LEAD_STATUS.CONTACTED]: '#f59e0b',
  [LEAD_STATUS.QUALIFIED]: '#10b981',
  [LEAD_STATUS.CONVERTED]: '#14b8a6',
  [LEAD_STATUS.LOST]: '#ef4444',
};

interface StatusChartProps {
  data: StatsData | undefined;
  isLoading: boolean;
}

export function StatusChart({ data, isLoading }: StatusChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-surface-container-high rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-surface-container-high rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = STATUS_ORDER.map((status) => ({
    name: status,
    value: data?.byStatus?.[status] ?? 0,
    color: CHART_COLORS[status],
  }));

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <h3 className="font-headline-sm text-headline-sm text-primary">Lead Status Distribution</h3>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="min-h-[16rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid #f1f5f9',
                    borderRadius: '0.75rem',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                    color: '#191c1e',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-body-sm text-on-surface">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="min-h-[16rem] flex items-center justify-center">
            <p className="text-body-md text-on-surface-variant">No data to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
