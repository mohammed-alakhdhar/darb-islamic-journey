import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Award, Check, Lock, ChevronLeft, ScrollText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StageHero from '@/components/stage/StageHero';
import AIGuidePanel from '@/components/AIGuidePanel';
import ChallengeView from '@/components/ChallengeView';
import { base44 } from '@/api/base44Client';
import { useUserProgress, isStageUnlocked, HIJRAH_LANDMARK_STAGES, getNextLandmarkStage } from '@/lib/darb';
import BadgeIcon from '@/components/hijrah/BadgeIcon';
import { useI18n } from '@/lib/i18n';

export default function Stage() {
  const { journeySlug = 'hijrah', order } = useParams();
  const stageOrder = Number(order);
  const navigate = useNavigate();
  const { progress, update, reload } = useUserProgress();
  const { t, stageMeta, verificationLabel } = useI18n();
  const [stage, setStage] = useState(null);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [sources, setSources] = useState({});
  const [guideOpen, setGuideOpen] = useState(false);
  const [badgeRecord, setBadgeRecord] = useState(null);
  const [stageDone, setStageDone] = useState(false);
  const [reward, setReward] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [currentSolved, setCurrentSolved] = useState(false);
  const initedForStage = useRef(null);

  useEffect(() => {
    setStage(null); setEvents([]); setChallenges([]); setStageDone(false); setReward(null);
    setChallengeIndex(0); setCurrentSolved(false); setBadgeRecord(null);
    Promise.all([
      base44.entities.JourneyStage.filter({ journey_slug: journeySlug, order: stageOrder }, 'order', 1),
      base44.entities.HistoricalEvent.filter({ journey_slug: journeySlug, stage_order: stageOrder }, 'created_date', 20),
      base44.entities.Challenge.filter({ journey_slug: journeySlug, stage_order: stageOrder }, 'created_date', 20),
      base44.entities.Badge.filter({ journey_slug: journeySlug, stage_order: stageOrder }, 'created_date', 1)
    ]).then(([s, e, c, b]) => {
      if (s.length) setStage(s[0]);
      setEvents(e);
      setChallenges(c);
      setBadgeRecord(b[0] || null);
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
  const isLocked = !isStageUnlocked(stageOrder, completedStages);
  const isLandmarkStage = HIJRAH_LANDMARK_STAGES.includes(stageOrder);
  const nextStage = getNextLandmarkStage(stageOrder);
  const stageBadge = stageDone && isLandmarkStage && completedStages.includes(stageOrder)
    ? (badgeRecord || (stage?.badge_name ? { name: stage.badge_name, description: '', icon: 'award' } : null))
    : null;

  // تهيئة مؤشر السؤال: ابدأ عند أول سؤال غير محلول، أو اعتبر المحطة مكتملة إن حُلّ جميعها
  useEffect(() => {
    if (challenges.length && initedForStage.current !== stageOrder) {
      initedForStage.current = stageOrder;
      const firstUnsolved = challenges.findIndex((c) => !completedChallenges.includes(c.id));
      if (firstUnsolved === -1) {
        const stageXp = challenges.reduce((s, c) => s + (c.xp_reward || 0), 0);
        setReward({ xp: stageXp });
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
      const isLandmark = HIJRAH_LANDMARK_STAGES.includes(stageOrder);
      const badgeData = isLandmark
        ? (badgeRecord || (stage?.badge_name ? { name: stage.badge_name, description: '', icon: 'award' } : null))
        : null;
      let newBadges = progress?.badges || [];
      let stageJustCompleted = false;
      let newCompletedStages = [...completedStages];
      if (!newCompletedStages.includes(stageOrder)) {
        newCompletedStages.push(stageOrder);
        stageJustCompleted = true;
        if (badgeData && !newBadges.includes(badgeData.name)) newBadges.push(badgeData.name);
      }
      const stageXp = challenges.reduce((s, c) => s + (c.xp_reward || 0), 0);
      const nextStage = getNextLandmarkStage(stageOrder);
      await update({
        completed_challenges: newChallenges,
        xp: (progress?.xp || 0) + gained,
        completed_stages: newCompletedStages,
        badges: newBadges,
        current_stage: nextStage || stageOrder
      });
      setStageDone(true);
      setReward({ xp: stageXp });
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

  const meta = stageMeta(stageOrder);
  const stageTitle = meta?.title || stage?.title || t('stage.stageLabel');
  const stageSubtitle = meta?.subtitle || stage?.subtitle;

  return (
    <div className="min-h-screen gradient-sand pb-28">
      <Navbar xp={progress?.xp} />

      {/* رأس المحطة السينمائي — صورة فريدة لكل محطة + انتقال Fade & Zoom */}
      <StageHero
        key={stageOrder}
        journeySlug={journeySlug}
        stageOrder={stageOrder}
        stageTitle={stageTitle}
        stageSubtitle={stageSubtitle}
        location={stage?.location || ''}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-8 space-y-6">
        {/* السرد — محتوى معرفي يبقى كما ورد في قاعدة المعرفة */}
        {stage?.narrative && (
          <div className="mt-8 sm:mt-12 rounded-3xl border border-border bg-card/95 backdrop-blur-sm p-7 sm:p-10 shadow-lift">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/70">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ScrollText className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('stage.historicalContext')}</h2>
            </div>
            <p className="leading-loose text-foreground/85 text-base sm:text-lg text-pretty">{stage.narrative}</p>
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

        {/* المكافأة + شارة المحطة */}
        {stageDone && reward && (
          <div className="rounded-3xl border-2 border-darb-gold bg-gradient-to-br from-darb-gold/10 to-card p-6 sm:p-8 text-center shadow-lift">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-darb-gold/20 text-darb-gold mb-3">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">{t('stage.wellDone')}</h3>
            <p className="mt-2 text-muted-foreground">{t('stage.xpEarned', { xp: reward.xp })}</p>

            {stageBadge && (
              <div className="mt-6 rounded-2xl border border-darb-gold/40 bg-gradient-to-br from-darb-gold/15 to-card p-5 animate-hero-rise">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-900 shadow-[0_0_28px_rgba(240,207,122,0.6)] animate-pulse-slow">
                  <BadgeIcon name={stageBadge.icon} className="h-10 w-10" />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-darb-gold/20 px-3 py-1 text-xs font-semibold text-darb-gold">
                  <Sparkles className="h-3.5 w-3.5" /> {t('stage.newBadgeTitle')}
                </div>
                <h4 className="mt-2 font-display text-xl font-bold text-foreground">{stageBadge.name}</h4>
                {stageBadge.description && <p className="mt-1 text-sm text-muted-foreground">{stageBadge.description}</p>}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {nextStage && (
                <button
                  onClick={() => navigate(`/journey/${journeySlug}/stage/${nextStage}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {t('stage.continueJourney')} <ChevronLeft className="h-4 w-4" />
                </button>
              )}
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