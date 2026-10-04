import { useEffect, useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';

const EMPTY = { source_id: '', source_name: '', document_title: '', chunk_text: '', journey_slug: 'hijrah', stage_order: 1, topic: '', reference: '', source_url: '', verification_status: 'verified', language: 'ar', keywords: '' };

export default function AdminChunks() {
  const { t, verificationLabel } = useI18n();
  const [items, setItems] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.KnowledgeChunk.list('-created_date', 100),
      base44.entities.KnowledgeSource.list('-created_date', 100)
    ]).then(([c, s]) => { setItems(c); setSources(s); }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.chunk_text || !form.source_name) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        stage_order: Number(form.stage_order) || 1,
        keywords: form.keywords ? form.keywords.split(/[،,]/).map((k) => k.trim()).filter(Boolean) : []
      };
      await base44.entities.KnowledgeChunk.create(payload);
      setForm(EMPTY);
      load();
    } finally { setSaving(false); }
  };

  const pickSource = (id) => {
    const s = sources.find((x) => x.id === id);
    setForm({ ...form, source_id: id, source_name: s?.name || form.source_name, reference: s?.reference || form.reference, source_url: s?.url || form.source_url, verification_status: s?.verification_status || form.verification_status });
  };

  const remove = async (c) => { await base44.entities.KnowledgeChunk.delete(c.id); load(); };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> {t('admin.chunks.addTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.source_id} onChange={(e) => pickSource(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">{t('admin.chunks.pickSource')}</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} placeholder={t('admin.sources.namePh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.document_title} onChange={(e) => setForm({ ...form, document_title: e.target.value })} placeholder={t('admin.chunks.docTitlePh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder={t('admin.chunks.topicPh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.stage_order} onChange={(e) => setForm({ ...form, stage_order: e.target.value })} type="number" placeholder={t('admin.chunks.stagePh')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder={t('common.reference')} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.chunk_text} onChange={(e) => setForm({ ...form, chunk_text: e.target.value })} placeholder={t('admin.chunks.textPh')} rows={4} className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder={t('admin.chunks.keywordsPh')} className="sm:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} disabled={saving || !form.chunk_text} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">{t('admin.chunks.save')}</button>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {items.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">{c.source_name}</span>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{t('admin.chunks.stageBadge', { n: c.stage_order })}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{verificationLabel(c.verification_status)}</span>
              </div>
              <p className="text-sm text-foreground/80 mt-1 line-clamp-2">{c.chunk_text}</p>
            </div>
            <button onClick={() => remove(c)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t('admin.chunks.empty')}</p>}
      </div>
    </div>
  );
}