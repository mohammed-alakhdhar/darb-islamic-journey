import { MessageCircle, Search, ShieldCheck, Brain, FileText, ArrowDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useUserProgress } from '@/lib/darb';

const PIPELINE = [
  { icon: MessageCircle, title: 'سؤال المستخدم', desc: 'يوجّه المستخدم سؤالًا لرفيق الدرب داخل المحطة.' },
  { icon: Search, title: 'فهم القصد', desc: 'يُحلَّل السؤال ويُحدَّد الدرب والمحطة الحالية.' },
  { icon: FileText, title: 'الاسترجاع', desc: 'يُبحث في قاعدة المعرفة الموثقة عن المقتطفات ذات الصلة.' },
  { icon: ShieldCheck, title: 'المعرفة الموثقة', desc: 'تُستخدم المقتطفات المسترجعة كسياق حصري للإجابة.' },
  { icon: Brain, title: 'التوليد', desc: 'يولّد النموذج إجابة مبنية على السياق فقط.' },
  { icon: FileText, title: 'الإجابة + المصدر', desc: 'تُعرض الإجابة مع المصدر ودرجة توثيقه.' }
];

export default function HowItWorks() {
  const { progress } = useUserProgress();
  return (
    <div className="min-h-screen gradient-sand">
      <Navbar xp={progress?.xp} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">كيف يعمل الذكاء الاصطناعي؟</h1>
          <p className="mt-3 text-muted-foreground">شفافية تقنية: كيف يجيب رفيق الدرب من قاعدة المعرفة الموثقة.</p>
        </div>

        <div className="space-y-3">
          {PIPELINE.map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-darb-gold/20 text-darb-gold text-xs font-bold">{i + 1}</span>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-darb-gold/40 bg-darb-gold/10 p-6">
          <h3 className="font-display text-lg font-bold text-foreground">ملاحظة حول الاسترجاع</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            يستخدم رفيق الدرب طبقة استرجاع (Retrieval) من قاعدة المعرفة الموثقة. النسخة الحالية تعتمد استرجاعًا قائمًا على الكلمات المفتاحية مع تطبيع للعربية، وهي مصممة لاستبدالها لاحقًا بمزود embeddings خارجي عبر مفتاح سري دون تغيير بقية النظام. لا يدّعي النظام استخدام استرجاع دلالي (semantic) إلا بعد تنفيذه فعليًا.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold text-foreground">قواعد الموثوقية</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• لا تُخترع مصادر أو أرقام أحاديث أو درجات صحة.</li>
            <li>• لا تُقدّم الرواية الضعيفة كحقيقة قاطعة.</li>
            <li>• عند عدم كفاية المصدر، يُعلن رفيق الدرب ذلك صراحة.</li>
            <li>• كل إجابة معرفية مرتبطة بمصدرها ودرجة توثيقه.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}