import { useNavigate } from 'react-router-dom';
import { Sprout, Scale, Mountain, ArrowLeft, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useUserProgress } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';

export default function LevelSelect() {
  const navigate = useNavigate();
  const { progress, update, loading } = useUserProgress();
  const { t, levelLabel, dir } = useI18n();

  const LEVELS = [
    {
      key: 'beginner',
      title: levelLabel('beginner'),
      icon: Sprout,
      desc: t('level.beginnerDesc'),
      points: [t('landing.featKb')]
    },
    {
      key: 'intermediate',
      title: levelLabel('intermediate'),
      icon: Scale,
      desc: t('level.intermediateDesc'),
      points: [t('level.intermediateDesc')]
    },
    {
      key: 'advanced',
      title: levelLabel('advanced'),
      icon: Mountain,
      desc: t('level.advancedDesc'),
      points: [t('level.advancedDesc')]
    }
  ];

  const choose = async (level) => {
    await update({ knowledge_level: level });
    navigate('/journey/hijrah');
  };

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowLeft;

  return (
    <div className="min-h-screen gradient-sand">
      <Navbar xp={progress?.xp} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{t('level.title')}</h1>
          <p className="mt-3 text-muted-foreground">{t('level.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {LEVELS.map((lvl) => {
            const active = progress?.knowledge_level === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => choose(lvl.key)}
                disabled={loading}
                className={`w-full text-right rounded-3xl border p-6 transition-all hover:-translate-y-0.5 ${
                  active ? 'border-primary bg-primary/5 shadow-lift' : 'border-border bg-card shadow-soft hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${active ? 'gradient-darb text-darb-cream' : 'bg-primary/10 text-primary'}`}>
                    <lvl.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold text-foreground">{lvl.title}</h3>
                      {active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">
                          <Check className="h-3 w-3" /> {t('common.current')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{lvl.desc}</p>
                  </div>
                  <Arrow className="h-5 w-5 text-muted-foreground mt-2" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}