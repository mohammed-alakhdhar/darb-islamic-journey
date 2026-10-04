import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Check, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function JourneyCard({ journey }) {
  const { t, journeyMeta, dir } = useI18n();
  const available = journey.status === 'available';
  const meta = journeyMeta(journey.slug) || {};
  const title = meta.title || journey.title;
  const subtitle = meta.subtitle || journey.subtitle;
  const description = meta.description || journey.description;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowLeft;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ${
        available
          ? 'border-border bg-card shadow-soft hover:shadow-lift hover:-translate-y-1'
          : 'border-border/60 bg-muted/40'
      }`}
    >
      <div className="relative h-44 overflow-hidden">
        <div className={`absolute inset-0 ${available ? 'gradient-darb' : 'bg-gradient-to-br from-muted to-muted/60'}`} />
        <div className="absolute inset-0 bg-arabesque opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 right-5 left-5 flex items-end justify-between">
          <div>
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              available ? 'bg-darb-gold/90 text-darb-navy' : 'bg-white/80 text-muted-foreground'
            }`}>
              {available ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {available ? t('common.available') : t('common.comingSoon')}
            </div>
          </div>
          <MapPin className={`h-6 w-6 ${available ? 'text-darb-gold' : 'text-muted-foreground/50'}`} />
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-display text-2xl font-bold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm font-medium text-darb-gold">{subtitle}</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>

        <div className="mt-5">
          {available ? (
            <Link
              to={`/journey/${journey.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('common.start')}
              <Arrow className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-5 py-2.5 text-sm font-medium text-muted-foreground">
              <Lock className="h-4 w-4" />
              {t('common.comingSoon')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}