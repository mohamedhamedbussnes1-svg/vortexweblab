import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { canPromptInstall, isInstalled, isIOS, promptInstall } =
    usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (canPromptInstall) {
      await promptInstall();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        data-testid="pwa-install-btn"
        onClick={handleClick}
        className={`flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 font-bold transition-colors cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
        }`}
      >
        {isIOS ? (
          <Share className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
        )}
        <span>تثبيت التطبيق على الهاتف</span>
      </button>

      {showGuide && (
        <div
          data-testid="pwa-install-guide"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          style={{ backgroundColor: 'rgba(12, 9, 7, 0.85)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-emerald-400/45 p-5 text-stone-100 shadow-2xl space-y-3.5"
            style={{ backgroundColor: '#1b1510' }}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2 font-display font-extrabold text-base text-emerald-300">
                <Smartphone className="w-5 h-5" />
                <span>تثبيت محاكي المعلم كتطبيق</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="إغلاق"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2 text-xs text-stone-200 leading-relaxed list-decimal list-inside">
                <li>
                  افتح اللعبة في متصفح <strong>Safari</strong> على الآيفون.
                </li>
                <li>
                  اضغط على زر المشاركة <strong>Share</strong> أسفل الشاشة.
                </li>
                <li>
                  اختر <strong>Add to Home Screen / إضافة إلى الشاشة الرئيسية</strong>.
                </li>
              </ol>
            ) : (
              <ol className="space-y-2 text-xs text-stone-200 leading-relaxed list-decimal list-inside">
                <li>
                  افتح رابط اللعبة في متصفح <strong>Chrome</strong> أو <strong>Edge</strong> على الموبايل أو الكمبيوتر.
                </li>
                <li>
                  اضغط على أيقونة التثبيت في شريط العنوان أو قائمة المتصفح (⋮).
                </li>
                <li>
                  اختر <strong>تثبيت التطبيق / Install App</strong> لتشغيلها كتطبيق مستقل.
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs cursor-pointer"
            >
              فهمت · إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
