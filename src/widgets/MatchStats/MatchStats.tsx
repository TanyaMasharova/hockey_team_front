'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface MatchStats {
  wins: {
    regular: number;
    overtime: number;
    penalty: number;
  };
  losses: {
    regular: number;
    overtime: number;
    penalty: number;
  };
}

interface MatchStatsChartProps {
  stats: MatchStats;
}

export const MatchStatsChart = ({ stats }: MatchStatsChartProps) => {
  const totalWins = stats.wins.regular + stats.wins.overtime + stats.wins.penalty;
  const totalLosses = stats.losses.regular + stats.losses.overtime + stats.losses.penalty;
  const total = totalWins + totalLosses;

  // Данные для общей статистики (победы/поражения)
  const generalData = [
    { name: 'Победы', value: totalWins, color: 'var(--chart-win-main)', type: 'win' },
    { name: 'Поражения', value: totalLosses, color: 'var(--chart-loss-main)', type: 'loss' },
  ].filter(item => item.value > 0);

  // Данные для побед
  const winsData = [
    { name: 'Осн. время', value: stats.wins.regular, color: 'var(--chart-win-regular)' },
    { name: 'Овертайм', value: stats.wins.overtime, color: 'var(--chart-win-overtime)' },
    { name: 'Буллиты', value: stats.wins.penalty, color: 'var(--chart-win-penalty)' },
  ].filter(item => item.value > 0);

  // Данные для поражений
  const lossesData = [
    { name: 'Осн. время', value: stats.losses.regular, color: 'var(--chart-loss-regular)' },
    { name: 'Овертайм', value: stats.losses.overtime, color: 'var(--chart-loss-overtime)' },
    { name: 'Буллиты', value: stats.losses.penalty, color: 'var(--chart-loss-penalty)' },
  ].filter(item => item.value > 0);

  const CustomLabel = ({ percent }: any) => {
    if (percent < 0.05) return null;
    return `${(percent * 100).toFixed(0)}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: 'var(--tooltip-bg)',
            padding: '8px 12px',
            border: `1px solid var(--tooltip-border)`,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '13px',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: 4 }}>{data.name}</p>
          <p style={{ margin: 0, color: data.color }}>{data.value} матчей</p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        Нет данных для отображения статистики
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '30px',
          flexWrap: 'wrap',
        }}
      >
        {/* Общая статистика */}
        {generalData.length > 0 && (
          <div style={{ textAlign: 'center', width: 300 }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              Общая статистика
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={generalData}
                  cx="50%"
                  cy="50%"
                  label={CustomLabel}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                >
                  {generalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '10px',
              }}
            >
              {generalData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Победы */}
        {totalWins > 0 && (
          <div style={{ textAlign: 'center', width: 300 }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--chart-win-main)',
                marginBottom: '10px',
              }}
            >
              Победы ({totalWins})
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={winsData}
                  cx="50%"
                  cy="50%"
                  label={CustomLabel}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                >
                  {winsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '10px',
                flexWrap: 'wrap',
              }}
            >
              {winsData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Поражения */}
        {totalLosses > 0 && (
          <div style={{ textAlign: 'center', width: 300 }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--chart-loss-main)',
                marginBottom: '10px',
              }}
            >
              Поражения ({totalLosses})
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lossesData}
                  cx="50%"
                  cy="50%"
                  label={CustomLabel}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                >
                  {lossesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '10px',
                flexWrap: 'wrap',
              }}
            >
              {lossesData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
