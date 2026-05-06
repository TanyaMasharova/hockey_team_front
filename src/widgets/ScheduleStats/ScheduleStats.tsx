'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MatchFuture } from '@/entities/Match';

interface FutureMatchesChartProps {
  matches: MatchFuture[];
}

export const FutureMatchesChart = ({ matches }: FutureMatchesChartProps) => {
  const homeMatches = matches.filter(match => match.home_away === 'home').length;
  const awayMatches = matches.filter(match => match.home_away === 'away').length;
  const total = matches.length;

  const data = [
    {
      name: `Домашние`,
      value: homeMatches,
      color: '#2196f3',
    },
    {
      name: `Выездные`,
      value: awayMatches,
      color: '#4caf50',
    },
  ].filter(item => item.value > 0);

  if (total === 0 || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Нет будущих матчей</div>
    );
  }

  const CustomLabel = ({ percent }: any) => {
    if (percent < 0.05) return null;
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              label={CustomLabel}
              outerRadius={120}
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
