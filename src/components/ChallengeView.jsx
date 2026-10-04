import { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, Award, RotateCcw } from 'lucide-react';
import SourceCard from './SourceCard';
import { useI18n } from '@/lib/i18n';

export default function ChallengeView({ challenge, source, onSolved, onFail }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);
  const [ordering, setOrdering] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!challenge) return null;

  const type = challenge.type;

  const checkMC = () => {
    const ok = selected === challenge.correct_answer;
    finish(ok);
  };

  const checkOrdering = () => {
    const ok = ordering.length === challenge.correct_order.length &&
      ordering.every((v, i) => v === challenge.correct_order[i]);
    finish(ok);
  };

  const finish = (ok) => {
    setCorrect(ok);
    setSubmitted(true);
    setAttempts((a) => a + 1);
    if (ok) onSolved?.(challenge);
    else onFail?.(challenge);
  };

  const reset = () => {
    setSelected(null);
    setOrdering([]);
    setSubmitted(false);
    setCorrect(false);
    setShowHint(false);
  };

  const moveUp = (i) => {
    if (i === 0) return;
    const arr = [...ordering];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setOrdering(arr);
  };
  const moveDown = (i) => {
    if (i === ordering.length - 1) return;
    const arr = [...ordering];
    [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
    setOrdering(arr);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-darb-gold/15 text-darb-gold">
          <Award className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('challenge.stageChallenge')} · {challenge.xp_reward} XP</div>
          {/* نص السؤال يبقى كما ورد في قاعدة المعرفة (عربي) */}
          <div className="font-semibold text-foreground">{challenge.question}</div>
        </div>
      </div>

      {/* اختيار من متعدد / صح وخطأ */}
      {(type === 'multiple_choice' || type === 'true_false' || type === 'knowledge') && (
        <div className="space-y-2">
          {(challenge.options || []).map((opt, i) => {
            const isCorrect = opt === challenge.correct_answer;
            const isSelected = selected === opt;
            const showState = submitted;
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => setSelected(opt)}
                className={`w-full text-start rounded-xl border px-4 py-3 text-sm transition-all flex items-center justify-between ${
                  showState && isCorrect ? 'border-primary bg-primary/10 text-primary font-medium'
                    : showState && isSelected && !isCorrect ? 'border-destructive bg-destructive/10 text-destructive'
                    : isSelected ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-background hover:border-primary/40'
                }`}
              >
                <span>{opt}</span>
                {showState && isCorrect && <CheckCircle2 className="h-5 w-5" />}
                {showState && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ترتيب الأحداث */}
      {type === 'ordering' && (
        <div className="space-y-2">
          {ordering.length === 0 && (challenge.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => setOrdering((o) => [...o, opt])}
              className="w-full text-start rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:border-primary/40 hover:bg-primary/5"
            >
              {opt}
            </button>
          ))}
          {ordering.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
              <span className="flex-1 text-sm">{opt}</span>
              <button onClick={() => moveUp(i)} className="text-xs text-muted-foreground hover:text-foreground">↑</button>
              <button onClick={() => moveDown(i)} className="text-xs text-muted-foreground hover:text-foreground">↓</button>
              <button onClick={() => setOrdering((o) => o.filter((x) => x !== opt))} className="text-xs text-destructive">{t('challenge.remove')}</button>
            </div>
          ))}
        </div>
      )}

      {/* تلميح */}
      {!submitted && challenge.hint && (
        <div className="mt-3">
          {showHint ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <Lightbulb className="inline h-4 w-4 ml-1" /> {t('challenge.hint', { hint: challenge.hint })}
            </div>
          ) : (
            <button onClick={() => setShowHint(true)} className="text-sm text-muted-foreground hover:text-darb-gold inline-flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" /> {t('challenge.showHint')}
            </button>
          )}
        </div>
      )}

      {/* إجراءات */}
      {!submitted ? (
        <div className="mt-5">
          {type === 'ordering' ? (
            <button
              onClick={checkOrdering}
              disabled={ordering.length !== (challenge.correct_order || challenge.options || []).length}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
            >
              {t('challenge.checkOrder')}
            </button>
          ) : (
            <button
              onClick={checkMC}
              disabled={!selected}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
            >
              {t('challenge.confirm')}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className={`rounded-xl p-4 ${correct ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            <div className="flex items-center gap-2 font-semibold">
              {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {correct ? t('challenge.correct') : t('challenge.incorrect')}
            </div>
            {challenge.explanation && (
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{challenge.explanation}</p>
            )}
          </div>
          {source && <SourceCard source={source} />}
          {!correct && (
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <RotateCcw className="h-4 w-4" /> {t('challenge.retry')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}