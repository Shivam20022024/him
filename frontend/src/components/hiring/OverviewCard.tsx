import React from 'react';

interface OverviewCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  );
};

export default OverviewCard;
