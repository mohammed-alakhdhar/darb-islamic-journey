import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, BookOpen, Award, Check, Lock, ChevronLeft, ScrollText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AIGuidePanel from '@/components/AIGuidePanel';
import ChallengeView from '@/components/ChallengeView';
import { base44 } from '@/api/base44Client';
import { useUserProgress } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';

export default function Stage() {
  const { journeySlug = 'hijrah', order } = useParams();
  const stageOrder = Number(order);
  const navigate = useNavigate();
  const { progress, update, reload } = useUserProgress();
  const { t, stageMeta, verificationLabel, dir } = useI18n();
  const [stage, setStage] = useState(null);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [sources, setSources] = useState({});
  const [guideOpen, setGuideOpen] = useState(false);
  const [stageDone, setStageDone] = useState(false);
  const [reward, setReward] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [currentSolved, setCurrentSolved] = useState(false);
  const initedForStage = useRef(null);

  useEffect(() => {
    setStage(null); setEvents([]); setChallenges([]); setStageDone(false); setReward(null);
    setChallengeIndex(0); setCurrentSolved(false);
    Promise.all([
      base44.entities.JourneyStage.filter({ journey_slug: journeySlug, order: stageOrder }, 'order', 1),
      base44.entities.HistoricalEvent.filter({ journey_slug: journeySlug, stage_order: stageOrder }, 'created_date', 20),
      base44.entities.Challenge.filter({ journey_slug: journeySlug, stage_order: stageOrder }, 'created_date', 20)
    ]).then(([s, e, c]) => {
      if (s.length) setStage(s[0]);
      setEvents(e);
      setChallenges(c);
    }).catch(() => {});
  }, [journeySlug, stageOrder]);

  // تحميل المصادر المرتبطة بالأحداث
  useEffect(() => {
    const ids = new Set();
    events.forEach((ev) => (ev.source_ids || []).forEach((id) => ids.add(id)));
    challenges.forEach((ch) => ch.source_id && ids.add(ch.source_id));
    if (!ids.size) return;
    base44.entities.KnowledgeSource.list('created_date', 100)
      .then((all) => {
        const map = {};
        all.forEach((s) => { map[s.id] = s; });
        setSources(map);
      })
      .catch(() => {});
  }, [events, challenges]);

  const completedStages = progress?.completed_stages || [];
  const completedChallenges = progress?.completed_challenges || [];
  const isLocked = stageOrder !== 1 && !completedStages.includes(stageOrder - 1);

  // تهيئة مؤشر السؤال: ابدأ عند أول سؤال غير محلول، أو اعتبر المحطة مكتملة إن حُلّ جميعها
  useEffect(() => {
    if (challenges.length && initedForStage.current !== stageOrder) {
      initedForStage.current = stageOrder;
      const firstUnsolved = challenges.findIndex((c) => !completedChallenges.includes(c.id));
      if (firstUnsolved === -1) {
        const stageXp = challenges.reduce((s, c) => s + (c.xp_reward || 0), 0);
        const badgeName = stage?.badge_name || `${t('stage.stageLabel')} ${stageOrder}`;
        setReward({ xp: stageXp, badge: completedStages.includes(stageOrder) ? badgeName : null });
        setStageDone(true);
      } else {
        setChallengeIndex(firstUnsolved);
      }
    }
  }, [challenges, completedChallenges, stageOrder]);

  const handleSolved = async (challenge) => {
    const isLast = challengeIndex >= challenges.length - 1;
    const already = completedChallenges.includes(challenge.id);
    const gained = already ? 0 : (challenge.xp_reward || 50);
    const newChallenges = already ? completedChallenges : [...completedChallenges, challenge.id];

    if (isLast) {
      // السؤال الأخير → إكمال المحطة
      let newBadges = progress?.badges || [];
      let stageJustCompleted = false;
      let newCompletedStages = [...completedStages];
      if (!newCompletedStages.includes(stageOrder)) {
        newCompletedStages.push(stageOrder);
        stageJustCompleted = true;
        const badgeName = stage?.badge_name || `${t('stage.stageLabel')} ${stageOrder}`;
        if (!newBadges.includes(badgeName)) newBadges.push(badgeName);
      }
      const stageXp = challenges.reduce((s, c) => s + (c.xp_reward || 0), 0);
      await update({
        completed_challenges: newChallenges,
        xp: (progress?.xp || 0) + gained,
        completed_stages: newCompletedStages,
        badges: newBadges,
        current_stage: stageOrder + 1
      });
      setStageDone(true);
      setReward({ xp: stageXp, badge: stageJustCompleted ? (stage?.badge_name || `${t('stage.stageLabel')} ${stageOrder}`) : null });
      reload();
    } else {
      // السؤال الأول → تسجيل الإجابة والبقاء على نتيجته حتى ينتقل المستخدم
      await update({
        completed_challenges: newChallenges,
        xp: (progress?.xp || 0) + gained
      });
      setCurrentSolved(true);
      reload();
    }
  };

  const goNextChallenge = () => {
    setCurrentSolved(false);
    setChallengeIndex((i) => i + 1);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen gradient-sand flex flex-col">
        <Navbar xp={progress?.xp} />
        <div className="flex-1 grid place-items-center px-4">
          <div className="text-center max-w-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">{t('stage.lockedTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('stage.lockedDesc')}</p>
            <Link to={`/journey/${journeySlug}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              <ArrowRight className="h-4 w-4" /> {t('stage.backToMap')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const env = stage?.environment || 'صحراء';
  const envGradient = {
    'مكة': 'from-darb-navy via-primary to-secondary',
    'غار': 'from-darb-navy via-darb-navy to-secondary',
    'صحراء': 'from-amber-700 via-darb-gold to-amber-500',
    'خيمة': 'from-amber-600 via-darb-gold to-amber-400',
    'مدينة': 'from-primary via-darb-green-soft to-darb-navy'
  }[env] || 'from-darb-navy to-primary';

  const meta = stageMeta(stageOrder);
  const stageTitle = meta?.title || stage?.title || t('stage.stageLabel');
  const stageSubtitle = meta?.subtitle || stage?.subtitle;
  const BackIcon = dir === 'rtl' ? ChevronLeft : ChevronLeft;

  return (
    <div className="min-h-screen gradient-sand pb-28">
      <Navbar xp={progress?.xp} />

      {/* رأس المحطة البيئي */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${envGradient}`} />
        <div className="absolute inset-0 bg-arabesque opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/40" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-10 pb-16 text-center text-primary-foreground">
          <Link to={`/journey/${journeySlug}`} className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6">
            <BackIcon className="h-4 w-4" /> {t('stage.mapLink')}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium mb-4">
            {t('stage.stageLabel')} {String(stageOrder).padStart(2, '0')}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">{stageTitle}</h1>
          {stageSubtitle && <p className="mt-2 text-primary-foreground/85 font-medium">{stageSubtitle}</p>}
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-foreground/70">
            <MapPin className="h-4 w-4" /> {stage?.location || ''}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-8 space-y-6">
        {/* السرد — محتوى معرفي يبقى كما ورد في قاعدة المعرفة */}
        {stage?.narrative && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <ScrollText className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold">{t('stage.historicalContext')}</h2>
            </div>
            <p className="leading-loose text-foreground/90 text-pretty">{stage.narrative}</p>
          </div>
        )}

        {/* الأحداث التاريخية — محتوى معرفي يبقى كما ورد */}
        {events.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">{t('stage.eventsTitle')}</h2>
            </div>
            {events.map((ev) => {
              const vLabel = verificationLabel(ev.verification_status) || verificationLabel('verified');
              const toneMap = { verified: 'green', historical: 'sand', needs_clarification: 'amber', insufficient: 'red' };
              const tone = toneMap[ev.verification_status] || 'green';
              return (
                <div key={ev.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold text-foreground">{ev.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      tone === 'green' ? 'bg-primary/10 text-primary' :
                      tone === 'sand' ? 'bg-darb-sand/40 text-darb-navy' :
                      tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{vLabel}</span>
                  </div>
                  {ev.summary && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ev.summary}</p>}
                  {ev.full_content && <p className="mt-2 text-sm leading-loose text-foreground/85">{ev.full_content}</p>}
                  {ev.people && ev.people.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ev.people.map((p) => (
                        <span key={p} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* التحدي */}
        {challenges.length > 0 && !stageDone && (
          <div>
            <div className="flex items-center justify-between gap-2 px-1 mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-darb-gold" />
                <h2 className="font-display text-lg font-bold text-foreground">{t('stage.challengeTitle')}</h2>
              </div>
              {challenges.length > 1 && (
                <span className="rounded-full bg-darb-gold/15 px-3 py-1 text-xs font-semibold text-darb-gold">
                  {t('challenge.questionOf', { current: challengeIndex + 1, total: challenges.length })}
                </span>
              )}
            </div>
            <ChallengeView
              key={challenges[challengeIndex]?.id || challengeIndex}
              challenge={challenges[challengeIndex]}
              source={sources[challenges[challengeIndex]?.source_id]}
              onSolved={handleSolved}
            />
            {currentSolved && challengeIndex < challenges.length - 1 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={goNextChallenge}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {t('challenge.nextQuestion')} <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* المكافأة */}
        {stageDone && reward && (
          <div className="rounded-3xl border-2 border-darb-gold bg-gradient-to-br from-darb-gold/10 to-card p-6 sm:p-8 text-center shadow-lift">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-darb-gold/20 text-darb-gold mb-3">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">{t('stage.wellDone')}</h3>
            <p className="mt-2 text-muted-foreground">{t('stage.xpEarned', { xp: reward.xp })}</p>
            {reward.badge && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" /> {t('stage.newBadge', { badge: reward.badge })}
              </div>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/journey/${journeySlug}/stage/${stageOrder + 1}`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t('stage.nextStage')} <ChevronLeft className="h-4 w-4" />
              </button>
              <Link to={`/journey/${journeySlug}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                {t('stage.viewMap')}
              </Link>
            </div>
          </div>
        )}

        {/* إذا لا توجد تحديات، زر إكمال */}
        {challenges.length === 0 && !stageDone && (
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
            <p className="text-muted-foreground text-sm">{t('stage.noChallenges')}</p>
            <button
              onClick={() => handleSolved({ id: `stage-${stageOrder}`, xp_reward: stage?.xp_reward || 100 })}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-4 w-4" /> {t('stage.completeStage')}
            </button>
          </div>
        )}
      </div>

      {/* زر رفيق الدرب الثابت */}
      <button
        onClick={() => setGuideOpen(true)}
        className="fixed bottom-6 left-6 z-30 inline-flex items-center gap-2 rounded-full gradient-darb px-5 py-3.5 text-primary-foreground shadow-lift hover:scale-105 transition-transform"
      >
        <Sparkles className="h-5 w-5 text-darb-gold" />
        <span className="font-semibold">{t('stage.guideButton')}</span>
      </button>

      <AIGuidePanel
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        journeySlug={journeySlug}
        stageOrder={stageOrder}
        knowledgeLevel={progress?.knowledge_level || 'beginner'}
        stageTitle={stageTitle}
      />
    </div>
  );
}