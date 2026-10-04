import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import LandmarkCard from './LandmarkCard';

// المعالم الثمانية المرئية على خريطة الهجرة — طبقة بصرية فوق المحطات الموثقة (JourneyStage).
// لا تُستبدل المحطات ولا تُحذف؛ كل معلم مرتبط بمحطته لاستكشافها.
const LANDMARKS = [
  { id: 'makkah', name: 'مكة', stage: 1 },
  { id: 'dar-al-nadwah', name: 'دار الندوة', stage: 2 },
  { id: 'ghar-thawr', name: 'غار ثور', stage: 3 },
  { id: 'tareeq-al-sahel', name: 'طريق الساحل', stage: 5 },
  { id: 'suraqah', name: 'سُراقة', stage: 6 },
  { id: 'umm-mabad', name: 'خيمة أم معبد', stage: 7 },
  { id: 'quba', name: 'قباء', stage: 9 },
  { id: 'madinah', name: 'المدينة المنورة', stage: 10 }
];

// نجوم الخلفية — مواضع ثابتة (لا عشوائية في كل رندر)
const STARS = Array.from({ length: 48 }, (_, i) => ({
  x: (i * 137.5) % 1000,
  y: (i * 73.3) % 360,
  r: (i % 3) * 0.5 + 0.6,
  delay: (i % 7) * 0.6
}));

// مسار منحني ناعم عبر النقاط (Catmull-Rom → Bezier)
function smoothPath(points) {
  if (points.length < 2) return '';
  const d = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
  }
  return d.join(' ');
}

export default function HijrahJourneyMap({ progress, stageMeta, t, onExplore }) {
  const completed = progress?.completed_stages || [];
  const currentStage = progress?.current_stage || 1;
  const [selected, setSelected] = useState(null);
  const [pathLen, setPathLen] = useState(0);
  const progressPathRef = useRef(null);

  const nodes = useMemo(() => {
    const W = 1000, H = 360, padX = 80, amp = 58;
    return LANDMARKS.map((lm, i) => {
      const x = W - padX - (i * (W - padX * 2)) / (LANDMARKS.length - 1);
      const y = H / 2 + Math.sin(i * 0.95) * amp;
      const done = completed.includes(lm.stage);
      const unlocked = lm.stage === 1 || completed.includes(lm.stage - 1);
      const isCurrent = !done && unlocked && currentStage === lm.stage;
      const status = done ? 'completed' : isCurrent ? 'current' : unlocked ? 'unlocked' : 'locked';
      return { ...lm, x, y, index: i, status, done, isCurrent, unlocked };
    });
  }, [completed, currentStage]);

  const points = nodes.map((n) => ({ x: n.x, y: n.y }));
  const pathD = useMemo(() => smoothPath(points), [points]);

  useEffect(() => {
    if (progressPathRef.current) {
      try { setPathLen(progressPathRef.current.getTotalLength() || 0); } catch { setPathLen(0); }
    }
  }, [pathD]);

  const completedCount = nodes.filter((n) => n.done).length;
  const fraction = nodes.length > 0 ? completedCount / nodes.length : 0;
  const dashOffset = pathLen ? pathLen * (1 - fraction) : 0;

  const stageSubtitle = (stage) => stageMeta(stage)?.subtitle || '';

  const handleNodeClick = (n) => {
    if (n.status === 'locked') return;
    setSelected(n);
  };

  const nodeStatusLabel = (n) =>
    n.done ? t('map.nodeCompleted')
      : n.isCurrent ? t('map.nodeCurrent')
        : n.status === 'locked' ? t('map.nodeLocked')
          : t('map.nodeExplore');

  return (
    <div className="relative">
      {/* ===== خريطة أفقية (سطح المكتب) — التقدّم من اليمين إلى اليسار ===== */}
      <div
        className="hidden md:block relative rounded-3xl overflow-hidden border border-amber-300/15 shadow-lift"
        style={{ background: 'radial-gradient(ellipse at 50% 28%, #14213d 0%, #0c1530 55%, #080d22 100%)' }}
      >
        {/* نجوم وتوهج */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 360" preserveAspectRatio="none">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f5d98a" opacity="0.5">
              <animate attributeName="opacity" values="0.12;0.7;0.12" dur="3.5s" begin={`${s.delay}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
        <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-56 w-56 rounded-full bg-emerald-700/15 blur-3xl" />

        <svg viewBox="0 0 1000 360" className="relative w-full h-auto" style={{ minHeight: 360 }}>
          <defs>
            <linearGradient id="goldPath" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#e9c46a" />
              <stop offset="50%" stopColor="#ccac5c" />
              <stop offset="100%" stopColor="#7c6233" />
            </linearGradient>
            <linearGradient id="goldPathActive" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="50%" stopColor="#f0cf7a" />
              <stop offset="100%" stopColor="#e9c46a" />
            </linearGradient>
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* المسار الأساسي */}
          <path d={pathD} fill="none" stroke="url(#goldPath)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          {/* المسار المكتمل (توهج ذهبي) */}
          <path
            ref={progressPathRef}
            d={pathD}
            fill="none"
            stroke="url(#goldPathActive)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#goldGlow)"
            strokeDasharray={pathLen || undefined}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.1s ease' }}
          />

          {/* العقد */}
          {nodes.map((n) => (
            <NodeDesktop key={n.id} n={n} label={nodeStatusLabel(n)} onClick={() => handleNodeClick(n)} />
          ))}
        </svg>
      </div>

      {/* ===== خط زمني عمودي (الجوال) — من الأعلى (مكة) إلى الأسفل (المدينة) ===== */}
      <div
        className="md:hidden relative rounded-3xl overflow-hidden border border-amber-300/15 p-5"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #14213d 0%, #0c1530 60%, #080d22 100%)' }}
      >
        <div className="relative">
          <div className="absolute right-[26px] top-2 bottom-2 w-1 rounded-full bg-amber-200/15" />
          <div
            className="absolute right-[26px] top-2 w-1 rounded-full bg-gradient-to-b from-amber-200 to-amber-500 transition-all duration-700"
            style={{ height: fraction > 0 ? `calc(${(fraction * 100).toFixed(2)}% - 16px)` : '0px' }}
          />
          <div className="space-y-4">
            {nodes.map((n) => (
              <NodeMobile key={n.id} n={n} label={nodeStatusLabel(n)} onClick={() => handleNodeClick(n)} />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <LandmarkCard
          landmark={selected}
          subtitle={stageSubtitle(selected.stage)}
          status={selected.status}
          t={t}
          onExplore={() => { onExplore(selected.stage); setSelected(null); }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function NodeDesktop({ n, label, onClick }) {
  const locked = n.status === 'locked';
  const done = n.status === 'completed';
  const current = n.status === 'current';
  const above = n.index % 2 === 0;
  const nameY = above ? n.y - 28 : n.y + 32;
  const statusY = above ? n.y - 14 : n.y + 46;
  return (
    <g
      onClick={onClick}
      style={{ cursor: locked ? 'default' : 'pointer', pointerEvents: 'all' }}
    >
      {current && (
        <circle cx={n.x} cy={n.y} r="20" fill="none" stroke="#f0cf7a" strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values="18;28;18" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.05;0.6" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      {done && <circle cx={n.x} cy={n.y} r="17" fill="#ccac5c" opacity="0.16" />}
      <circle
        cx={n.x} cy={n.y} r={current ? 14 : 11}
        fill={done ? '#ccac5c' : current ? '#f0cf7a' : locked ? '#16233f' : '#0f1a36'}
        stroke={done ? '#fff3c4' : current ? '#fff3c4' : locked ? '#334155' : '#ccac5c'}
        strokeWidth="2"
        filter={done || current ? 'url(#goldGlow)' : undefined}
      />
      {done ? (
        <path
          d={`M ${n.x - 4} ${n.y} L ${n.x - 1} ${n.y + 3.5} L ${n.x + 4.5} ${n.y - 3.5}`}
          fill="none" stroke="#0c1530" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        />
      ) : locked ? (
        <g transform={`translate(${n.x - 5} ${n.y - 5})`} fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round">
          <rect x="1" y="4" width="8" height="6" rx="1.2" fill="#16233f" />
          <path d="M2.5 4 V2.6 a2.5 2.5 0 0 1 5 0 V4" />
        </g>
      ) : (
        <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#0c1530">
          {n.stage}
        </text>
      )}
      <text
        x={n.x} y={nameY} textAnchor="middle" fontSize="13" fontWeight="600"
        fill={locked ? '#5b6b86' : '#f5e9c8'}
        style={{ fontFamily: 'Tajawal, sans-serif' }}
      >
        {n.name}
      </text>
      <text
        x={n.x} y={statusY} textAnchor="middle" fontSize="9.5" fontWeight="500"
        fill={done ? '#f0cf7a' : current ? '#fff3c4' : locked ? '#475569' : '#9fb3d0'}
      >
        {label}
      </text>
    </g>
  );
}

function NodeMobile({ n, label, onClick }) {
  const locked = n.status === 'locked';
  const done = n.status === 'completed';
  const current = n.status === 'current';
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="relative flex items-center gap-4 w-full text-right"
    >
      <div
        className={`relative z-10 shrink-0 grid place-items-center rounded-full border-2 transition-all ${
          done
            ? 'bg-amber-400 border-amber-200 text-slate-900'
            : current
              ? 'bg-amber-300 border-amber-100 text-slate-900 animate-pulse-slow'
              : locked
                ? 'bg-slate-800 border-slate-600 text-slate-500'
                : 'bg-slate-900 border-amber-400/70 text-amber-200'
        }`}
        style={{ height: 52, width: 52 }}
      >
        {done ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <span className="font-display font-bold text-sm">{n.stage}</span>}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${locked ? 'text-slate-500' : 'text-amber-50'}`}>{n.name}</div>
        <div className={`text-xs ${done ? 'text-amber-300' : current ? 'text-amber-100' : locked ? 'text-slate-600' : 'text-slate-400'}`}>
          {label}
        </div>
      </div>
    </button>
  );
}