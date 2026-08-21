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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="relative p-4">
            <div className="mb-3 inline-flex rounded-2xl bg-slate-100 p-2 text-blue-600 transition-transform duration-200 group-hover:scale-105">
              {stat.icon}
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {stat.title}
            </h3>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-2xl font-black text-slate-950">
                {stat.value}
              </div>
              {stat.trend && (
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                    stat.trend === 'up'
                      ? 'bg-emerald-50 text-emerald-700'
                      : stat.trend === 'down'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {stat.trendValue}
                </div>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {stat.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedStatsCards;
