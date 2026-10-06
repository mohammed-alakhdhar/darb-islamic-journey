import { useEffect, useState } from 'react';
import { X, Lock, Check, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { HIJRAH_LANDMARK_STAGES } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';
import BadgeIcon from './BadgeIcon';

export default function BadgesModal({ open, onClose, completedStages }) {
  const { t, stageMeta } = useI18n();
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!open) return;
    base44.entities.Badge.filter({ journey_slug: 'hijrah' }, 'stage_order', 50)
      .then((all) => {
        const order = new Map(HIJRAH_LANDMARK_STAGES.map((s, i) => [s, i]));
        const list = all
          .filter((b) => order.has(b.stage_order))
          .sort((a, b) => order.get(a.stage_order) - order.get(b.stage_order));
        setBadges(list);
      })
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const completed = completedStages || [];
  const earnedCount = badges.filter((b) => completed.includes(b.stage_order)).length;
  const total = badges.length || HIJRAH_LANDMARK_STAGES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-amber-300/20 bg-[#0c1530] shadow-lift">
        <div className="flex items-center justify-between gap-3 border-b border-amber-300/15 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-amber-50">{t('badges.title')}</h2>
              <p className="text-xs text-amber-100/60">{t('badges.count', { count: earnedCount, total })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-amber-300/20 text-amber-100/70 hover:bg-white/5"
            aria-label={t('badges.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin px-5 py-5" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((b) => {
              const earned = completed.includes(b.stage_order);
              const stageTitle = stageMeta(b.stage_order)?.title || '';
              return (
                <div
                  key={b.id}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    earned
                      ? 'border-amber-300/30 bg-gradient-to-br from-amber-400/10 to-amber-500/5'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                        earned
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-slate-900 shadow-[0_0_18px_rgba(240,207,122,0.45)]'
                          : 'bg-white/5 text-amber-100/30'
                      }`}
                    >
                      <BadgeIcon name={b.icon} className="h-6 w-6" />
                      {!earned && (
                        <span className="absolute -bottom-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-[#0c1530] border border-white/10">
                          <Lock className="h-3 w-3 text-amber-100/40" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-display font-bold ${earned ? 'text-amber-50' : 'text-amber-100/50'}`}>{b.name}</h3>
                        {earned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                            <Check className="h-3 w-3" /> {t('badges.earned')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-amber-100/40">
                            {t('badges.locked')}
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-xs leading-relaxed ${earned ? 'text-amber-100/70' : 'text-amber-100/40'}`}>
                        {earned ? (b.description || '') : t('badges.lockedHint', { stage: stageTitle })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}