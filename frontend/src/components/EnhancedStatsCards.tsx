import React from 'react';
import { Users, BriefcaseBusiness, Heart, TrendingUp } from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface EnhancedStatsCardsProps {
  stats: StatCard[];
}

const EnhancedStatsCards: React.FC<EnhancedStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-[15px] font-semibold text-slate-600">
              {stat.title}
            </h3>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              {stat.icon}
            </div>
          </div>
          
          <div className="mt-4 flex items-end justify-between">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {stat.value}
            </div>
            {stat.trend && stat.trend !== 'neutral' && (
              <div
                className={`flex items-center gap-1 text-sm font-bold ${
                  stat.trend === 'up'
                    ? 'text-emerald-500'
                    : 'text-blue-600'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>{stat.trendValue}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedStatsCards;
