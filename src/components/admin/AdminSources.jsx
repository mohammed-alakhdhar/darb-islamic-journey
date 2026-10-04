import { useEffect, useState } from 'react';
import { Plus, Trash2, Power, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';

const EMPTY = { name: '', type: 'historical', reference: '', url: '', verification_status: 'needs_clarification', publisher: '', description: '', language: 'ar', active: true };

export default function AdminSources() {
  const { t, sourceTypeLabel, verificationLabel } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const TYPES = ['hadith', 'historical', 'secondary', 'insufficient'];
  const VERIFS = ['verified', 'historical', 'needs_clarification', 'insufficient'];

  const load = () => {
    setLoading(true);
    base44.entities.KnowledgeSource.list('-created_date', 100)
      .then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await base44.entities.KnowledgeSource.create(form);
      setForm(EMPTY);
      load();
    } finally { setSaving(false); }
  };

  const toggle = async (s) => {
    await base44.entities.KnowledgeSource.update(s.id, { active: !s.active });
    load();
  };
  const remove = async (s) => {
    await base44.entities.KnowledgeSource.delete(s.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> {t('admin.sources.addTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('admin.sources.namePh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {TYPES.map((k) => <option key={k} value={k}>{sourceTypeLabel(k)}</option>)}
          </select>
          <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder={t('admin.sources.refPh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder={t('admin.sources.urlPh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.verification_status} onChange={(e) => setForm({ ...form, verification_status: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {VERIFS.map((k) => <option key={k} value={k}>{verificationLabel(k)}</option>)}
          </select>
          <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder={t('admin.sources.publisherPh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('admin.sources.descPh')} className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} disabled={saving || !form.name} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">{t('admin.sources.save')}</button>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {items.map((s) => (
          <div key={s.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{sourceTypeLabel(s.type)}</span>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{verificationLabel(s.verification_status)}</span>
                {!s.active && <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">{t('admin.sources.disabled')}</span>}
              </div>
              {s.reference && <p className="text-xs text-muted-foreground mt-1">{t('common.reference')}: {s.reference}</p>}
            </div>
            <button onClick={() => toggle(s)} className="text-muted-foreground hover:text-primary" title={t('admin.sources.toggleTitle')}><Power className="h-4 w-4" /></button>
            <button onClick={() => remove(s)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t('admin.sources.empty')}</p>}
      </div>
    </div>
  );
}