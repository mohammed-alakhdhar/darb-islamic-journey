import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Sparkles, ShieldCheck, Map, BookOpen, Brain } from 'lucide-react';
import Navbar from '@/components/Navbar';
import JourneyCard from '@/components/JourneyCard';
import { Image } from '@/components/ui/image';
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
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        <Image
          src="https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/b116618b8_generated_image.png"
          alt=""
          fittingType="fill"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* تدرج سينمائي داكن — أخضر داكن / تيل عميق مع لمسة ذهبية */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f1a]/80 via-[#0c2620]/65 to-[#0e2a23]/88" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070d0b]/75 via-transparent to-[#0b1f1a]/55" />
        {/* توهج ذهبي دافئ */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-darb-gold/12 blur-[130px]" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-emerald-800/20 blur-[100px]" />
        {/* Vignette خفيف حول الأطراف */}
        <div className="absolute inset-0 shadow-[inset_0_0_180px_70px_rgba(5,14,11,0.65)]" />
        {/* نقش عربي خفيف */}
        <div className="absolute inset-0 bg-arabesque opacity-[0.08]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-24 sm:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-darb-gold/40 bg-darb-gold/15 px-4 py-1.5 text-sm font-medium text-amber-50 mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-darb-gold" />
            {t('landing.heroBadge')}
          </div>
          <h1 className="font-display text-7xl sm:text-9xl font-bold text-amber-50 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">دَرْب</h1>
          <p className="mt-5 font-display text-xl sm:text-3xl text-gradient-gold font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">{t('landing.heroSubtitle')}</p>
          <p className="mx-auto mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-amber-50/80 text-pretty">
            {t('landing.heroDesc')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/level" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-300 to-amber-500 px-8 py-4 text-base font-bold text-slate-900 shadow-[0_10px_40px_rgba(240,207,122,0.4)] hover:shadow-[0_14px_50px_rgba(240,207,122,0.55)] hover:-translate-y-0.5 transition-all">
              {t('landing.startJourney')}
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <a href="#journeys" className="group inline-flex items-center gap-2 rounded-xl border border-amber-100/25 bg-white/5 px-8 py-4 text-base font-semibold text-amber-50 backdrop-blur-sm hover:bg-white/10 hover:border-amber-100/40 transition-all">
              <Compass className="h-5 w-5 text-darb-gold" />
              {t('landing.exploreJourneys')}
            </a>
          </div>

          {/* شارات الثقة */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-amber-100/15 bg-white/[0.04] p-4 text-center backdrop-blur-sm">
                <f.icon className="h-6 w-6 text-darb-gold" />
                <span className="text-xs sm:text-sm font-medium text-amber-50/90">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* كيف يعمل دَرْب */}
      <section className="relative overflow-hidden">
        {/* انتقال ناعم من الـHero الداكن إلى الرمل الدافئ */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0e2a23] via-[#163027]/70 to-transparent" />
        {/* خلفية رملية دافئة عميقة */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8dcc4] via-[#ece2cf] to-[#e3d7be]" />
        <div className="absolute inset-0 bg-arabesque opacity-[0.05]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-28">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-darb-gold/60" />
              <Compass className="h-5 w-5 text-darb-gold" />
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-darb-gold/60" />
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0e2a23] tracking-tight">{t('landing.howTitle')}</h2>
            <p className="mt-3 text-[#3a4a3f]/80">{t('landing.howSubtitle')}</p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* مسار درب الرحلة — خط رفيل يربط شارات الخطوات (ديسكتوب) */}
            <div className="hidden lg:block absolute top-2 right-0 left-0 h-px bg-gradient-to-l from-transparent via-darb-gold/45 to-transparent" />
            {howSteps.map((s) => (
              <div key={s.n} className="group relative rounded-3xl border border-darb-gold/15 bg-gradient-to-b from-[#fbf6ec] to-[#f3ead6] p-6 pt-10 shadow-[0_4px_24px_rgba(14,42,35,0.08)] hover:shadow-[0_12px_40px_rgba(14,42,35,0.14)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-5 right-1/2 translate-x-1/2 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#1e4d3a] to-[#0e2a23] text-amber-50 font-display text-xl font-bold shadow-[0_6px_18px_rgba(14,42,35,0.35)] ring-4 ring-[#ece2cf]">{s.n}</div>
                <h3 className="mt-3 font-display font-bold text-[#0e2a23]">{s.title}</h3>
                <p className="mt-2 text-sm text-[#3a4a3f]/75 leading-relaxed">{s.desc}</p>
              </div>
            ))}
            <div className="group relative rounded-3xl border border-darb-gold/30 bg-gradient-to-br from-[#1e4d3a] to-[#0e2a23] p-6 sm:col-span-2 lg:col-span-4 shadow-[0_6px_24px_rgba(14,42,35,0.2)] hover:shadow-[0_14px_40px_rgba(14,42,35,0.3)] transition-all duration-300 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-darb-gold" />
                <h3 className="font-display font-bold text-amber-50">{t('landing.endlessTitle')}</h3>
              </div>
              <p className="mt-3 text-sm text-amber-50/75 leading-relaxed max-w-2xl">{t('landing.endlessDesc')}</p>
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