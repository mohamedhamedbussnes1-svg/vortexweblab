import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      data-testid="offline-indicator"
      className="fixed bottom-3 left-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400/50 bg-[#231912] text-amber-200 text-xs font-bold shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>وضع أوفلاين — اللعب الفردي شغال</span>
    </div>
  );
};
