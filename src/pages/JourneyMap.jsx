import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, ArrowLeft, BookOpen, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HijrahJourneyMap from '@/components/hijrah/HijrahJourneyMap';
import BadgesModal from '@/components/hijrah/BadgesModal';
import { useUserProgress, HIJRAH_LANDMARK_STAGES } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';

export default function JourneyMap({ journeySlug = 'hijrah' }) {
  const navigate = useNavigate();
  const { progress, update } = useUserProgress();
  const { t, journeyMeta, stageMeta } = useI18n();
  const [badgesOpen, setBadgesOpen] = useState(false);

  const startJourney = () => {
    const stage = progress?.current_stage && progress.current_stage > 1 ? progress.current_stage : 1;
    update({ current_journey: 'hijrah', current_stage: stage });
    navigate(`/journey/hijrah/stage/${stage}`);
  };

  const exploreStory = () => {
    document.getElementById('journey-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExplore = (stageOrder) => {
    update({ current_journey: 'hijrah', current_stage: stageOrder });
    navigate(`/journey/hijrah/stage/${stageOrder}`);
  };

  // الدروب القادمة — بطاقة بسيطة (لا تتأثر بإعادة تصميم درب الهجرة)
  if (journeySlug !== 'hijrah') {
    const jMeta = journeyMeta(journeySlug) || {};
    return (
      <div className="min-h-screen gradient-sand">
        <Navbar xp={progress?.xp} />
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
          <Compass className="mx-auto h-12 w-12 text-darb-gold" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{jMeta.title || t('map.title')}</h1>
          <p className="mt-2 text-muted-foreground">{jMeta.subtitle}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
            {t('common.comingSoon')}
          </span>
        </div>
      </div>
    );
  }

  const completed = progress?.completed_stages || [];
  const totalStages = HIJRAH_LANDMARK_STAGES.length;
  const completedCount = HIJRAH_LANDMARK_STAGES.filter((s) => completed.includes(s)).length;
  const earnedBadges = completedCount;
  const pct = Math.round((completedCount / totalStages) * 100);

  return (
    <div className="min-h-screen bg-[#080d22] text-amber-50">
      <Navbar xp={progress?.xp} />

      {/* ===== البطل ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-24 left-10 h-72 w-72 rounded-full bg-emerald-700/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-sm font-medium text-amber-200 mb-6">
            <Compass className="h-4 w-4" /> {t('map.badge')}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-amber-50 tracking-tight">{t('map.heroTitle')}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-amber-100/75 text-pretty">
            {t('map.heroSubtitle')}
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startJourney}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 px-7 py-3.5 text-base font-bold text-slate-900 shadow-[0_8px_30px_rgba(240,207,122,0.35)] hover:from-amber-300 hover:to-amber-400 transition-colors"
            >
              {t('map.startJourney')} <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={exploreStory}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-amber-100 hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-5 w-5" /> {t('map.exploreStory')}
            </button>
            <button
              onClick={() => setBadgesOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-7 py-3.5 text-base font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors"
            >
              <Award className="h-5 w-5" /> {t('map.badgesButton')}
            </button>
          </div>
        </div>
      </section>

      {/* ===== مؤشر التقدم ===== */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-amber-300/15 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-amber-100/60">{t('map.progressLabel')}</div>
                <div className="font-display text-lg font-bold text-amber-50 leading-none">{progress?.xp || 0} XP</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold text-amber-50">{earnedBadges}</span>
              <span className="text-xs text-amber-100/60">{t('xpbar.badges')}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-amber-100/70 mb-1.5">
            <span>{t('map.stagesCompleted')}</span>
            <span>{completedCount} / {totalStages}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-l from-amber-200 via-amber-400 to-amber-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* ===== الخريطة التفاعلية ===== */}
      <section id="journey-map" className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        <HijrahJourneyMap progress={progress} stageMeta={stageMeta} t={t} onExplore={handleExplore} />
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-amber-100/40">
        <p className="font-display text-base font-bold text-amber-100/70">دَرْب</p>
        <p className="mt-1 px-4">{t('landing.footerNote')}</p>
      </footer>

      <BadgesModal open={badgesOpen} onClose={() => setBadgesOpen(false)} completedStages={progress?.completed_stages || []} />
    </div>
  );
}