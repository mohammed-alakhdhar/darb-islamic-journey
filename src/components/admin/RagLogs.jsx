import { useEffect, useState } from 'react';
import { ScrollText, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';

export default function RagLogs() {
  const { t, lang } = useI18n();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.RagLog.list('-created_date', 30)
      .then(setLogs).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const locale = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en';

  return (
    <div className="space-y-3">
      {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
      {logs.map((log) => (
        <div key={log.id} className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-start gap-2">
            <ScrollText className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{log.question}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.answer}</p>
              <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
                <span className={`rounded-full px-2 py-0.5 font-medium ${
                  log.retrieval_status === 'found' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'
                }`}>{log.retrieval_status === 'found' ? t('rag.found') : t('rag.insufficient')}</span>
                {log.sources && log.sources.length > 0 && (
                  <span className="text-muted-foreground">{log.sources.join('، ')}</span>
                )}
                <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                  <Clock className="h-3 w-3" /> {new Date(log.created_date).toLocaleString(locale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {!loading && logs.length === 0 && <p className="text-sm text-muted-foreground">{t('logs.empty')}</p>}
    </div>
  );
}