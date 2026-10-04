import { useEffect, useState } from 'react';
import { Shield, BookOpen, FileText, Award, Sparkles, ScrollText, LayoutDashboard, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminSources from '@/components/admin/AdminSources';
import AdminChunks from '@/components/admin/AdminChunks';
import AdminChallenges from '@/components/admin/AdminChallenges';
import RagEval from '@/components/admin/RagEval';
import RagLogs from '@/components/admin/RagLogs';
import { base44 } from '@/api/base44Client';
import { useUserProgress } from '@/lib/darb';
import { useI18n } from '@/lib/i18n';

export default function Admin() {
  const { progress } = useUserProgress();
  const { t } = useI18n();
  const [tab, setTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(null);
  const [counts, setCounts] = useState({});

  const TABS = [
    { key: 'overview', label: t('admin.tab.overview'), icon: LayoutDashboard },
    { key: 'sources', label: t('admin.tab.sources'), icon: BookOpen },
    { key: 'chunks', label: t('admin.tab.chunks'), icon: FileText },
    { key: 'challenges', label: t('admin.tab.challenges'), icon: Award },
    { key: 'rag', label: t('admin.tab.rag'), icon: Sparkles },
    { key: 'logs', label: t('admin.tab.logs'), icon: ScrollText }
  ];

  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (tab !== 'overview' || !isAdmin) return;
    Promise.all([
      base44.entities.KnowledgeSource.list('-created_date', 200),
      base44.entities.KnowledgeChunk.list('-created_date', 200),
      base44.entities.Challenge.list('-created_date', 200),
      base44.entities.JourneyStage.filter({ journey_slug: 'hijrah' }, 'order', 50),
      base44.entities.RagLog.list('-created_date', 200)
    ]).then(([s, c, ch, st, l]) => {
      setCounts({ sources: s.length, chunks: c.length, challenges: ch.length, stages: st.length, logs: l.length, insufficient: l.filter((x) => x.retrieval_status !== 'found').length });
    }).catch(() => {});
  }, [tab, isAdmin]);

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center"><div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-sand grid place-items-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground mb-4"><Lock className="h-8 w-8" /></div>
          <h2 className="font-display text-2xl font-bold text-foreground">{t('admin.accessTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('admin.accessDesc')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: t('admin.stat.sources'), value: counts.sources ?? '—', icon: BookOpen, tone: 'bg-primary/10 text-primary' },
    { label: t('admin.stat.chunks'), value: counts.chunks ?? '—', icon: FileText, tone: 'bg-darb-gold/15 text-darb-gold' },
    { label: t('admin.stat.challenges'), value: counts.challenges ?? '—', icon: Award, tone: 'bg-secondary/10 text-secondary' },
    { label: t('admin.stat.stages'), value: counts.stages ?? '—', icon: LayoutDashboard, tone: 'bg-primary/10 text-primary' },
    { label: t('admin.stat.logs'), value: counts.logs ?? '—', icon: ScrollText, tone: 'bg-muted text-muted-foreground' },
    { label: t('admin.stat.insufficient'), value: counts.insufficient ?? '—', icon: Sparkles, tone: 'bg-amber-100 text-amber-700' }
  ];

  return (
    <div className="min-h-screen gradient-sand">
      <Navbar xp={progress?.xp} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-darb text-darb-cream"><Shield className="h-6 w-6" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t('admin.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === tb.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <tb.icon className="h-4 w-4" /> {tb.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}><s.icon className="h-5 w-5" /></div>
                <div className="mt-3 font-display text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 rounded-2xl border border-darb-gold/40 bg-darb-gold/10 p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-darb-gold" /> {t('admin.noteTitle')}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('admin.noteDesc')}</p>
            </div>
          </div>
        )}
        {tab === 'sources' && <AdminSources />}
        {tab === 'chunks' && <AdminChunks />}
        {tab === 'challenges' && <AdminChallenges />}
        {tab === 'rag' && <RagEval />}
        {tab === 'logs' && <RagLogs />}
      </div>
    </div>
  );
}