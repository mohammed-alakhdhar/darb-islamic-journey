import { useEffect, useState, useCallback } from 'react';

// تسميات درجات التوثيق
export const VERIFICATION_LABELS = {
  verified: { label: 'موثّق', tone: 'green' },
  historical: { label: 'رواية تاريخية', tone: 'sand' },
  needs_clarification: { label: 'يحتاج بيان', tone: 'amber' },
  insufficient: { label: 'غير كافٍ', tone: 'red' }
};

export const LEVEL_LABELS = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

export const SOURCE_TYPE_LABELS = {
  hadith: 'حديث',
  historical: 'رواية تاريخية',
  secondary: 'مصدر ثانوي',
  insufficient: 'معلومة غير كافية'
};

// بيانات الدروب الاحتياطية (تُعرض حتى لو لم تُحمّل من قاعدة البيانات)
export const JOURNEYS_FALLBACK = [
  { slug: 'hijrah', title: 'درب الهجرة', subtitle: 'لا تقرأ الهجرة… اكتشفها', description: 'اكتشف رحلة الهجرة النبوية من مكة إلى المدينة خطوة بخطوة.', status: 'available', order: 1, accent: 'green' },
  { slug: 'dawah', title: 'درب الدعوة', subtitle: 'بدايات الدعوة', description: 'اكتشف بدايات الدعوة ومراحلها.', status: 'coming_soon', order: 2, accent: 'navy' },
  { slug: 'dawah-jahriyah', title: 'درب الدعوة الجهرية', subtitle: 'المرحلة الجهرية', description: 'اكتشف مرحلة الدعوة الجهرية وما ارتبط بها من أحداث.', status: 'coming_soon', order: 3, accent: 'navy' },
  { slug: 'madinah', title: 'درب المدينة', subtitle: 'بداية المرحلة الجديدة', description: 'اكتشف المدينة وبدايات المرحلة الجديدة بعد الهجرة.', status: 'coming_soon', order: 4, accent: 'navy' },
  { slug: 'athar', title: 'درب الأثر', subtitle: 'المعالم التاريخية', description: 'رحلة مستقبلية لاكتشاف المواقع التاريخية والمعالم المرتبطة بالسيرة.', status: 'coming_soon', order: 5, accent: 'gold' }
];

// خطوات «كيف يعمل دَرْب»
export const HOW_STEPS = [
  { n: '1', title: 'اختر دربك', desc: 'ابدأ باختيار رحلة معرفية تناسب اهتمامك.' },
  { n: '2', title: 'استكشف', desc: 'تنقّل بين محطات الرحلة على الخريطة التفاعلية.' },
  { n: '3', title: 'تعلّم', desc: 'اقرأ السياق التاريخي لكل محطة بأسلوب سردي.' },
  { n: '4', title: 'اسأل رفيق الدرب', desc: 'وجّه أسئلتك للمرشد الذكي في أي محطة.' },
  { n: '5', title: 'تحقّق من المصدر', desc: 'كل إجابة معرفية مرتبطة بمصدرها ودرجة توثيقها.' },
  { n: '6', title: 'حلّ التحدي', desc: 'اختبر فهمك بتحديات تكيّفت مع مستواك.' },
  { n: '7', title: 'افتح المرحلة التالية', desc: 'اكسب نقاط الخبرة والشارات، وتابع رحلتك.' }
];

// هوك إدارة تقدم المستخدم (تخزين محلي — يعمل للزوار دون تسجيل دخول)
const PROGRESS_KEY = 'darb_progress_v1';
const DEFAULT_PROGRESS = {
  knowledge_level: 'beginner',
  current_journey: 'hijrah',
  current_stage: 1,
  xp: 0,
  badges: [],
  completed_stages: [],
  completed_challenges: []
};

function readProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_PROGRESS };
}

export function useUserProgress() {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProgress(readProgress());
    setLoading(false);
  }, []);

  const update = useCallback((patch) => {
    setProgress((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const reload = useCallback(() => { setProgress(readProgress()); }, []);

  return { progress, loading, update, reload };
}