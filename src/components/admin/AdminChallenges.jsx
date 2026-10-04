import { useEffect, useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TYPES = [
  { key: 'multiple_choice', label: 'اختيار من متعدد' },
  { key: 'true_false', label: 'صح / خطأ' },
  { key: 'ordering', label: 'ترتيب الأحداث' },
  { key: 'knowledge', label: 'سؤال معرفي' }
];
const LEVELS = [{ key: 'beginner', label: 'مبتدئ' }, { key: 'intermediate', label: 'متوسط' }, { key: 'advanced', label: 'متقدم' }];

const EMPTY = { journey_slug: 'hijrah', stage_order: 1, type: 'multiple_choice', question: '', options: '', correct_answer: '', correct_order: '', explanation: '', hint: '', difficulty: 'beginner', xp_reward: 50, source_id: '' };

export default function AdminChallenges() {
  const [items, setItems] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.Challenge.list('-created_date', 100),
      base44.entities.KnowledgeSource.list('-created_date', 100)
    ]).then(([c, s]) => { setItems(c); setSources(s); }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.question) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        stage_order: Number(form.stage_order) || 1,
        xp_reward: Number(form.xp_reward) || 50,
        options: form.options ? form.options.split('\n').map((o) => o.trim()).filter(Boolean) : [],
        correct_order: form.correct_order ? form.correct_order.split('\n').map((o) => o.trim()).filter(Boolean) : []
      };
      await base44.entities.Challenge.create(payload);
      setForm(EMPTY);
      load();
    } finally { setSaving(false); }
  };

  const remove = async (c) => { await base44.entities.Challenge.delete(c.id); load(); };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> إضافة تحدٍ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input value={form.stage_order} onChange={(e) => setForm({ ...form, stage_order: e.target.value })} type="number" placeholder="رقم المحطة" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="نص السؤال" className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="الخيارات (كل خيار في سطر)" rows={3} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.correct_order} onChange={(e) => setForm({ ...form, correct_order: e.target.value })} placeholder="الترتيب الصحيح (للترتيب فقط)" rows={3} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} placeholder="الإجابة الصحيحة" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
          <input value={form.hint} onChange={(e) => setForm({ ...form, hint: e.target.value })} placeholder="تلميح" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: e.target.value })} type="number" placeholder="نقاط XP" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="الشرح بعد الإجابة" className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.source_id} onChange={(e) => setForm({ ...form, source_id: e.target.value })} className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">بدون مصدر مرتبط</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button onClick={add} disabled={saving || !form.question} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">حفظ التحدي</button>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>}
        {items.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Award className="h-5 w-5 text-darb-gold mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">محطة {c.stage_order}</span>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{c.xp_reward} XP</span>
              </div>
              <p className="text-sm text-foreground mt-1">{c.question}</p>
            </div>
            <button onClick={() => remove(c)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">لا توجد تحديات بعد.</p>}
      </div>
    </div>
  );
}