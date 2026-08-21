import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Hiring Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            A concise view of candidate flow, progress, and next steps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
