import React from 'react';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';

interface NotificationBannerProps {
  tone: 'success' | 'info' | 'warning';
  message: string;
}

const styles = {
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  info: {
    wrap: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: <TriangleAlert className="h-4 w-4" />,
  },
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({ tone, message }) => {
  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${styles[tone].wrap}`}>
      {styles[tone].icon}
      <span>{message}</span>
    </div>
  );
};

export default NotificationBanner;
