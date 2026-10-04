import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Sparkles, ShieldCheck, Map, BookOpen, Brain } from 'lucide-react';
import Navbar from '@/components/Navbar';
import JourneyCard from '@/components/JourneyCard';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useUserProgress } from '@/lib/darb';

export default function Landing() {
  const { progress } = useUserProgress();
  const { t, howSteps } = useI18n();
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    base44.entities.Journey.list('order', 20)
      .then((list) => { if (list.length) setJourneys(list); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: Brain, label: t('landing.featAi') },
    { icon: ShieldCheck, label: t('landing.featSource') },
    { icon: Map, label: t('landing.featMap') },
    { icon: BookOpen, label: t('landing.featKb') }
  ];

  return (
    <div className="min-h-screen gradient-sand">
      <Navbar xp={progress?.xp} />

      {/* البطل */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-arabesque opacity-50" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-darb-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-darb-gold/40 bg-darb-gold/10 px-4 py-1.5 text-sm font-medium text-darb-navy mb-6">
            <Sparkles className="h-4 w-4 text-darb-gold" />
            {t('landing.heroBadge')}
          </div>
          <h1 className="font-display text-6xl sm:text-8xl font-bold text-foreground tracking-tight">دَرْب</h1>
          <p className="mt-4 font-display text-xl sm:text-2xl text-gradient-gold font-semibold">{t('landing.heroSubtitle')}</p>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground text-pretty">
            {t('landing.heroDesc')}
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/level" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors">
              {t('landing.startJourney')}
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <a href="#journeys" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground hover:bg-muted/60 transition-colors">
              <Compass className="h-5 w-5" />
              {t('landing.exploreJourneys')}
            </a>
          </div>

          {/* شارات الثقة */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/70 p-4 text-center">
                <f.icon className="h-6 w-6 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* كيف يعمل دَرْب */}
      <section className="py-16 sm:py-20 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{t('landing.howTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('landing.howSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howSteps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-xl gradient-darb text-darb-cream font-display text-lg font-bold">{s.n}</div>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
            <div className="relative rounded-2xl border border-darb-gold/40 bg-darb-gold/10 p-5 flex flex-col justify-center">
              <Sparkles className="h-8 w-8 text-darb-gold" />
              <h3 className="mt-3 font-semibold text-foreground">{t('landing.endlessTitle')}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t('landing.endlessDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* اختر دربك */}
      <section id="journeys" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{t('landing.journeysTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('landing.journeysSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((j) => (
              <JourneyCard key={j.slug} journey={j} />
            ))}
          </div>
        </div>
      </section>

      {/* دعوة ختامية */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl gradient-darb p-10 sm:p-14 text-center text-primary-foreground">
            <div className="absolute inset-0 bg-arabesque opacity-30" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold">{t('landing.ctaTitle')}</h2>
              <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">{t('landing.ctaDesc')}</p>
              <Link to="/level" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-darb-gold px-7 py-3.5 text-base font-semibold text-darb-navy hover:bg-darb-gold/90 transition-colors">
                {t('landing.ctaButton')}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p className="font-display text-lg font-bold text-foreground">دَرْب</p>
          <p className="mt-1">{t('landing.footerTagline')}</p>
          <p className="mt-3 text-xs">{t('landing.footerNote')}</p>
        </div>
      </footer>
    </div>
  );
}