import { useState } from 'react';
import { Sparkles, Loader2, BookOpen, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SourceCard from '@/components/SourceCard';

const EXAMPLES = [
  'من كان يأتي بالأخبار من مكة أثناء وجود النبي ﷺ في غار ثور؟',
  'كم مكث النبي ﷺ في غار ثور؟',
  'من كان دليل الطريق؟',
  'من هو سراقة بن مالك؟',
  'ما قصة أم معبد؟',
  'متى وصل النبي ﷺ إلى قباء؟'
];

export default function RagEval() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (q) => {
    const query = (q || question).trim();
    if (!query) return;
    setQuestion(query);
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('ragQuery', { question: query, journey_slug: 'hijrah', stage_order: null, knowledge_level: 'intermediate' });
      setResult(res.data || res);
    } catch (e) {
      setResult({ error: e.message || 'فشل الاستدعاء' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-darb-gold" /> تقييم RAG</h3>
        <p className="text-sm text-muted-foreground mb-3">اكتب سؤالًا لاختبار الاسترجاع والإجابة والمصدر.</p>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="اكتب سؤال الاختبار…" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={() => run()} disabled={loading || !question.trim()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} تشغيل الاختبار
        </button>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
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
              <span className="font-medium text-foreground">حالة الاسترجاع: {result.retrieval_status === 'found' ? 'وُجدت مصادر' : 'لا يوجد مصدر كافٍ'}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{result.answer}</p>
          </div>

          {result.retrieved_chunks && result.retrieved_chunks.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> المقتطفات المسترجعة ({result.retrieved_chunks.length})</h4>
              <div className="space-y-2">
                {result.retrieved_chunks.map((c, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3 text-xs">
                    <div className="font-medium text-foreground">{c.source_name} — {c.reference || 'بدون مرجع'}</div>
                    <div className="text-muted-foreground mt-0.5">المحطة {c.stage_order} · {c.verification_status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.sources && result.sources.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> المصادر المستخدمة</h4>
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