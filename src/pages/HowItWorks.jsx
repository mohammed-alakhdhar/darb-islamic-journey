import { MessageCircle, Search, ShieldCheck, Brain, FileText, ArrowDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useUserProgress } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';

const PIPELINE_ICONS = [MessageCircle, Search, FileText, ShieldCheck, Brain, FileText];

export default function HowItWorks() {
  const { progress } = useUserProgress();
  const { t, howPipeline, howRetrievalDesc, howRules } = useI18n();

  return (
    <div className="min-h-screen gradient-sand">
      <Navbar xp={progress?.xp} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{t('how.title')}</h1>
          <p className="mt-3 text-muted-foreground">{t('how.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {howPipeline.map((step, i) => {
            const Icon = PIPELINE_ICONS[i] || FileText;
            return (
              <div key={i}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-darb-gold/20 text-darb-gold text-xs font-bold">{i + 1}</span>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < howPipeline.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-darb-gold/40 bg-darb-gold/10 p-6">
          <h3 className="font-display text-lg font-bold text-foreground">{t('how.retrievalTitle')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{howRetrievalDesc}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold text-foreground">{t('how.rulesTitle')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {howRules.map((rule, i) => (
              <li key={i}>• {rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}