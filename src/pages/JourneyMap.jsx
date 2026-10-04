import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, MapPin, Play, Sparkles, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import XPBar from '@/components/XPBar';
import { base44 } from '@/api/base44Client';
import { useUserProgress } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';

const STAGES_FALLBACK = [
  { order: 1, title: 'مكة والاستعداد', subtitle: 'الإذن بالهجرة', environment: 'مكة', location: 'مكة المكرمة' },
  { order: 2, title: 'الخروج من مكة', subtitle: 'ليلة الهجرة', environment: 'مكة', location: 'مكة المكرمة' },
  { order: 3, title: 'غار ثور', subtitle: 'الاختباء', environment: 'غار', location: 'غار ثور' },
  { order: 4, title: 'ثلاثة أيام في الغار', subtitle: 'الإمداد ونقل الأخبار', environment: 'غار', location: 'غار ثور' },
  { order: 5, title: 'الانطلاق في طريق الهجرة', subtitle: 'طريق الساحل', environment: 'صحراء', location: 'طريق الساحل' },
  { order: 6, title: 'مطاردة سراقة', subtitle: 'طلب الأمان', environment: 'صحراء', location: 'طريق الهجرة' },
  { order: 7, title: 'خيمة أم معبد', subtitle: 'المرور بأم معبد', environment: 'خيمة', location: 'قديد' },
  { order: 8, title: 'الاقتراب من المدينة', subtitle: 'استقبال الأنصار', environment: 'صحراء', location: 'المدينة' },
  { order: 9, title: 'قباء', subtitle: 'أول مسجد', environment: 'مدينة', location: 'قباء' },
  { order: 10, title: 'الوصول إلى المدينة', subtitle: 'بداية المرحلة المدنية', environment: 'مدينة', location: 'المدينة المنورة' }
];

const ENV_COLORS = {
  'مكة': 'from-darb-navy to-primary',
  'غار': 'from-darb-navy to-secondary',
  'صحراء': 'from-darb-gold to-amber-600',
  'خيمة': 'from-amber-600 to-darb-gold',
  'مدينة': 'from-primary to-darb-green-soft'
};

export default function JourneyMap({ journeySlug = 'hijrah' }) {
  const navigate = useNavigate();
  const { progress, loading, update } = useUserProgress();
  const { t, journeyMeta, stageMeta } = useI18n();
  const [stages, setStages] = useState(STAGES_FALLBACK);
  const [journey, setJourney] = useState(null);

  useEffect(() => {
    base44.entities.JourneyStage.filter({ journey_slug: journeySlug }, 'order', 50)
      .then((list) => { if (list.length) setStages(list); })
      .catch(() => {});
    base44.entities.Journey.filter({ slug: journeySlug }, 'order', 1)
      .then((list) => { if (list.length) setJourney(list[0]); })
      .catch(() => {});
  }, [journeySlug]);

  const completed = progress?.completed_stages || [];
  const isUnlocked = (order) => order === 1 || completed.includes(order - 1);
  const isCompleted = (order) => completed.includes(order);
  const isCurrent = (order) => progress?.current_stage === order && !isCompleted(order);

  const openStage = (order) => {
    if (!isUnlocked(order)) return;
    update({ current_journey: journeySlug, current_stage: order });
    navigate(`/journey/${journeySlug}/stage/${order}`);
  };

  const startDemo = () => {
    update({ current_journey: journeySlug, current_stage: 1 });
    navigate(`/journey/${journeySlug}/stage/1`);
  };

  const total = stages.length;
  const jMeta = journeyMeta(journeySlug) || {};
  const title = jMeta.title || journey?.title || t('map.title');
  const subtitle = jMeta.subtitle || journey?.subtitle || t('map.subtitle');
  const description = jMeta.description || journey?.description || t('map.desc');

  const stageDisplay = (stage) => {
    const meta = stageMeta(stage.order);
    return {
      title: meta?.title || stage.title,
      subtitle: meta?.subtitle || stage.subtitle
    };
  };

  return (
    <div className="min-h-screen gradient-sand">
      <Navbar xp={progress?.xp} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {/* رأس الدرب */}
        <div className="relative overflow-hidden rounded-3xl gradient-darb p-8 sm:p-10 text-primary-foreground mb-8">
          <div className="absolute inset-0 bg-arabesque opacity-25" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-darb-gold/20 text-darb-gold px-3 py-1 text-xs font-medium mb-3">
              <Compass className="h-3.5 w-3.5" /> {t('map.badge')}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{title}</h1>
            <p className="mt-2 text-primary-foreground/80 font-medium">{subtitle}</p>
            <p className="mt-3 text-sm text-primary-foreground/70 max-w-2xl">{description}</p>
            <button onClick={startDemo} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-darb-gold px-6 py-3 text-sm font-semibold text-darb-navy hover:bg-darb-gold/90">
              <Play className="h-4 w-4" /> {t('map.startFirst')}
            </button>
          </div>
        </div>

        {/* التقدم */}
        <div className="mb-8">
          <XPBar xp={progress?.xp || 0} completed={completed.length} total={total} badges={progress?.badges || []} />
        </div>

        {/* خريطة المحطات */}
        <div className="relative">
          <div className="absolute right-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-darb-gold via-primary to-darb-navy" />
          <div className="space-y-4">
            {stages.map((stage) => {
              const unlocked = isUnlocked(stage.order);
              const done = isCompleted(stage.order);
              const current = isCurrent(stage.order);
              const env = ENV_COLORS[stage.environment] || 'from-darb-navy to-primary';
              const disp = stageDisplay(stage);
              return (
                <div key={stage.order} className="relative flex items-start gap-4">
                  {/* العقدة */}
                  <div className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-soft transition-all ${
                    done ? 'bg-primary text-primary-foreground'
                      : current ? 'bg-darb-gold text-darb-navy animate-float-slow'
                      : unlocked ? 'bg-card border-2 border-darb-gold text-foreground'
                      : 'bg-muted border-2 border-border text-muted-foreground'
                  }`}>
                    {done ? <Check className="h-6 w-6" /> : unlocked ? <span className="font-display text-lg font-bold">{stage.order}</span> : <Lock className="h-5 w-5" />}
                  </div>

                  {/* البطاقة */}
                  <button
                    onClick={() => openStage(stage.order)}
                    disabled={!unlocked}
                    className={`group flex-1 text-right rounded-2xl border p-5 transition-all ${
                      unlocked ? 'border-border bg-card shadow-soft hover:shadow-lift hover:-translate-y-0.5' : 'border-border/60 bg-muted/30 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-lg font-bold text-foreground">{disp.title}</h3>
                          {current && <span className="rounded-full bg-darb-gold/20 text-darb-gold px-2 py-0.5 text-xs font-medium">{t('map.current')}</span>}
                          {done && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{t('common.completed')}</span>}
                          {!unlocked && <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs">{t('common.locked')}</span>}
                        </div>
                        {disp.subtitle && <p className="mt-1 text-sm text-muted-foreground">{disp.subtitle}</p>}
                        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {stage.location}</span>
                          {unlocked && !done && (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <Sparkles className="h-3.5 w-3.5" /> {t('map.explore')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`hidden sm:block h-16 w-24 rounded-xl bg-gradient-to-br ${env} opacity-80`} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}