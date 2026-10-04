import { MapPin, X, ArrowLeft } from 'lucide-react';

// بطاقة معلومات مدمجة تظهر عند اختيار معلم على خريطة الهجرة
export default function LandmarkCard({ landmark, subtitle, status, t, onExplore, onClose }) {
  const done = status === 'completed';
  const current = status === 'current';
  const locked = status === 'locked';
  const statusLabel = done
    ? t('map.nodeCompleted')
    : current
      ? t('map.nodeCurrent')
      : locked
        ? t('map.nodeLocked')
        : t('map.nodeExplore');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-amber-300/30 bg-gradient-to-b from-[#152138] to-[#0b1124] p-6 shadow-lift text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10"
          aria-label={t('common.close')}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full bg-amber-400/15 text-amber-200 text-xs font-bold">
            {landmark.stage}
          </span>
          <span
            className={`text-xs font-medium ${
              done ? 'text-amber-300' : current ? 'text-amber-100' : 'text-slate-400'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <h3 className="font-display text-2xl font-bold text-amber-50">{landmark.name}</h3>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-300">{subtitle}</p>}

        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5" />
          {t('map.landmarkOf', { n: landmark.index + 1, total: 8 })}
        </div>

        <button
          onClick={onExplore}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 px-5 py-3 text-sm font-bold text-slate-900 hover:from-amber-300 hover:to-amber-400 transition-colors"
        >
          {t('map.exploreStage')}
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}