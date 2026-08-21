import React from 'react';
import { Phone, CheckCircle, Clock, AlertCircle, Mail } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'resume_uploaded' | 'call' | 'mail_sent' | 'response' | 'interested' | 'not_interested';
  candidateName: string;
  message: string;
  timestamp: string;
}

interface LiveActivityPanelProps {
  activities: ActivityItem[];
  isLive?: boolean;
}

const LiveActivityPanel: React.FC<LiveActivityPanelProps> = ({
  activities,
  isLive = false,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mail_sent':
        return <Mail className="h-4 w-4" />;
      case 'resume_uploaded':
        return <CheckCircle className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'response':
        return <Clock className="h-4 w-4" />;
      case 'interested':
        return <CheckCircle className="h-4 w-4" />;
      case 'not_interested':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'mail_sent':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'resume_uploaded':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'call':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'response':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'interested':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'not_interested':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getActivityBadgeText = (type: string) => {
    switch (type) {
      case 'mail_sent':
        return 'Mail Sent';
      case 'resume_uploaded':
        return 'Uploaded';
      case 'call':
        return 'Calling';
      case 'response':
        return 'Response';
      case 'interested':
        return 'Interested';
      case 'not_interested':
        return 'Not Interested';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Live Activity</h2>
          <p className="mt-1 text-sm text-slate-600">
            Real-time updates from your outreach campaign
          </p>
        </div>
        {isLive && (
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-700">LIVE</span>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {activities.filter(a => a.type === 'resume_uploaded' || a.type === 'call' || a.type === 'mail_sent').length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">No activity yet</h3>
          <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
            Pipeline activity will appear here once candidate processing begins.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities
            .filter(
              (activity) =>
                activity.type === 'resume_uploaded' || activity.type === 'call' || activity.type === 'mail_sent'
            )
            .map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
              {/* Timeline line and icon */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                {index < activities.length - 1 && (
                  <div className="mt-2 h-8 w-0.5 bg-gradient-to-b from-slate-200 to-slate-100" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {activity.candidateName}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {activity.message}
                      </p>
                    </div>
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityBadgeText(activity.type)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveActivityPanel;
