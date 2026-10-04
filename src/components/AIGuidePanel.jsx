import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, BookOpen, Loader2, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SourceCard from './SourceCard';
import { useI18n } from '@/lib/i18n';

export default function AIGuidePanel({ open, onClose, journeySlug, stageOrder, knowledgeLevel, stageTitle }) {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const SUGGESTIONS = {
    ar: [
      'ماذا حدث هنا؟',
      'من كان مع النبي ﷺ؟',
      'ما مصدر هذه المعلومة؟',
      'هل هذه الرواية صحيحة؟',
      'أعطني تلميحًا',
      'اشرح لي بطريقة مبسطة'
    ],
    en: [
      'What happened here?',
      'Who was with the Prophet ﷺ?',
      'What is the source of this?',
      'Is this narration authentic?',
      'Give me a hint',
      'Explain it simply'
    ],
    fr: [
      'Que s’est-il passé ici ?',
      'Qui était avec le Prophète ﷺ ?',
      'Quelle est la source de cela ?',
      'Cette narration est-elle authentique ?',
      'Donnez-moi un indice',
      'Expliquez simplement'
    ]
  };
  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.ar;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const ask = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: question };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await base44.functions.invoke('ragQuery', {
        question,
        journey_slug: journeySlug,
        stage_order: stageOrder,
        knowledge_level: knowledgeLevel,
        language: lang
      });
      const data = res.data || res;
      setMessages((m) => [...m, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        retrieval_status: data.retrieval_status,
        sufficient: data.sufficient
      }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: t('guide.errorRetry'), error: true }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end sm:p-4">
      <div className="absolute inset-0 bg-darb-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[85vh] sm:h-[600px] w-full sm:max-w-md flex-col rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-lift overflow-hidden">
        {/* رأس */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-l from-primary to-secondary p-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-darb-gold/20 text-darb-gold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-base font-bold">{t('guide.title')}</div>
              <div className="text-xs text-primary-foreground/70">{stageTitle || t('guide.subtitle')}</div>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10" aria-label={t('common.close')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* الرسائل */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 bg-muted/30">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="font-medium text-foreground">{t('guide.askPrompt')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('guide.askDesc')}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-bl-md'
                  : 'bg-card border border-border text-foreground rounded-br-md shadow-soft'
              }`}>
                <p className="whitespace-pre-wrap text-pretty">{m.content}</p>
                {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" /> {t('guide.sourcesUsed')}
                    </div>
                    {m.sources.map((s, j) => (
                      <SourceCard key={j} source={s} />
                    ))}
                  </div>
                )}
                {m.role === 'assistant' && m.retrieval_status === 'no_match' && (
                  <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                    {t('guide.noMatchNote')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-md bg-card border border-border p-3.5 shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* اقتراحات */}
        {messages.length === 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* إدخال */}
        <div className="border-t border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
              placeholder={t('guide.inputPlaceholder')}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => ask()}
              disabled={loading || !input.trim()}
              className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
              aria-label={t('common.send')}
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}