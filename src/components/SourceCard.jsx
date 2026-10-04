import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SourceCard({ source }) {
  const { t, verificationLabel } = useI18n();
  if (!source) return null;
  const vLabel = verificationLabel(source.verification_status) || verificationLabel('insufficient');
  const toneClasses = {
    green: 'bg-primary/10 text-primary border-primary/20',
    sand: 'bg-darb-sand/40 text-darb-navy border-darb-sand',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  };
  // نحتفظ بنفس خريطة النغمات الأصلية من درجة التوثيق
  const toneMap = { verified: 'green', historical: 'sand', needs_clarification: 'amber', insufficient: 'red' };
  const tone = toneClasses[toneMap[source.verification_status] || 'red'];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* اسم المصدر يبقى كما ورد في الأصل (عربي) — لا يُترجم تلقائيًا */}
            <h4 className="font-semibold text-foreground">{source.name || t('source.unnamed')}</h4>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>
              <ShieldCheck className="h-3 w-3" />
              {vLabel}
            </span>
          </div>
          {source.reference && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t('common.reference')}: </span>{source.reference}
            </p>
          )}
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t('source.viewSource')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}