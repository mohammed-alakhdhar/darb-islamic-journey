import { useState } from 'react';
import { Sparkles, Loader2, BookOpen, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SourceCard from '@/components/SourceCard';
import { useI18n } from '@/lib/i18n';

export default function RagEval() {
  const { t, lang } = useI18n();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const EXAMPLES = {
    ar: [
      'من كان يأتي بالأخبار من مكة أثناء وجود النبي ﷺ في غار ثور؟',
      'كم مكث النبي ﷺ في غار ثور؟',
      'من كان دليل الطريق؟',
      'من هو سراقة بن مالك؟',
      'ما قصة أم معبد؟',
      'متى وصل النبي ﷺ إلى قباء؟'
    ],
    en: [
      'Who brought news from Mecca while the Prophet ﷺ was in Cave Thawr?',
      'How long did the Prophet ﷺ stay in Cave Thawr?',
      'Who was the guide on the route?',
      'Who is Suraqah ibn Malik?',
      'What is the story of Umm Ma’bad?',
      'When did the Prophet ﷺ arrive at Quba?'
    ],
    fr: [
      'Qui apportait les nouvelles de La Mecque pendant que le Prophète ﷺ était dans la grotte de Thawr ?',
      'Combien de temps le Prophète ﷺ est-il resté dans la grotte de Thawr ?',
      'Qui était le guide sur la route ?',
      'Qui est Suraqa ibn Malik ?',
      'Quelle est l’histoire d’Umm Ma’bad ?',
      'Quand le Prophète ﷺ est-il arrivé à Quba ?'
    ]
  };
  const examples = EXAMPLES[lang] || EXAMPLES.ar;

  const run = async (q) => {
    const query = (q || question).trim();
    if (!query) return;
    setQuestion(query);
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('ragQuery', { question: query, journey_slug: 'hijrah', stage_order: null, knowledge_level: 'intermediate', language: lang });
      setResult(res.data || res);
    } catch (e) {
      setResult({ error: e.message || t('rag.invokeFail') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-darb-gold" /> {t('rag.title')}</h3>
        <p className="text-sm text-muted-foreground mb-3">{t('rag.desc')}</p>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('rag.placeholder')} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={() => run()} disabled={loading || !question.trim()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {loading ? t('rag.running') : t('rag.run')}
        </button>
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button key={ex} onClick={() => run(ex)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
              {ex}
            </button>
          ))}
        </div>
      </div>

      {result && !result.error && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              {result.retrieval_status === 'found' ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
              <span className="font-medium text-foreground">{result.retrieval_status === 'found' ? t('rag.found') : t('rag.insufficient')}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{result.answer}</p>
          </div>

          {result.retrieved_chunks && result.retrieved_chunks.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {t('rag.chunksTitle', { n: result.retrieved_chunks.length })}</h4>
              <div className="space-y-2">
                {result.retrieved_chunks.map((c, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3 text-xs">
                    <div className="font-medium text-foreground">{c.source_name} — {c.reference || t('rag.noReference')}</div>
                    <div className="text-muted-foreground mt-0.5">{t('admin.chunks.stageBadge', { n: c.stage_order })} · {c.verification_status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.sources && result.sources.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {t('rag.sourcesUsed')}</h4>
              <div className="space-y-2">
                {result.sources.map((s, i) => <SourceCard key={i} source={s} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {result && result.error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{result.error}</div>
      )}
    </div>
  );
}