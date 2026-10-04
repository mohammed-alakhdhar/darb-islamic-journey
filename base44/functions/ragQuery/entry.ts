import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { retrieveChunks, buildContext, normalizeArabic } from '../../shared/retrieval.ts';

// رفيق الدرب — استرجاع معزز بالتوليد (RAG)
// يسترجع مقتطفات المعرفة الموثقة، يبني سياقًا، ثم يولّد إجابة مبنية على المصدر فقط.
// لا يستخدم المعرفة العامة للنموذج بديلًا عن المصدر، ولا يخترع مصادرًا أو أحاديث.

const LEVEL_GUIDE = {
  beginner: "مستوى مبتدئ: اشرح بأسلوب بسيط ومفصّل، استخدم جُملاً قصيرة، وركّز على الفكرة الرئيسية.",
  intermediate: "مستوى متوسط: اشرح بأسلوب متوازن مع سياق إضافي مناسب.",
  advanced: "مستوى متقدم: اشرح بإيجاز مع إشارة إلى درجة التوثيق واختلاف الروايات إن وُجد."
};

// لغة الإجابة — الاسترجاع يبقى كما هو، فقط لغة التوليد تتغيّر
const LANG_LABEL = {
  ar: "بالعربية",
  en: "in clear, respectful English",
  fr: "en français clair et respectueux"
};

const NO_MATCH_ANSWER = {
  ar: "لا أملك في قاعدة المعرفة الحالية مصدرًا كافيًا للإجابة بدقة. يمكنك تجربة سؤال آخر مرتبط بالمحطة الحالية.",
  en: "I don't have a sufficient source in the current knowledge base to answer accurately. You can try another question related to the current stage.",
  fr: "Je n'ai pas de source suffisante dans la base de savoir actuelle pour répondre avec précision. Vous pouvez essayer une autre question liée à l'étape actuelle."
};

const SYSTEM_PROMPT = `أنت "رفيق الدرب"، مرشد تاريخي تعليمي إسلامي مرافق للمستخدم في رحلة معرفية تفاعلية عن السيرة والتاريخ الإسلامي.

قواعد صارمة:
1. أجب بالعربية فقط، وبأسلوب هادئ ومحترم.
2. استخدم حصرًا المعلومات الموجودة في "سياق المعرفة الموثقة" المرفق. لا تستخدم معرفتك العامة كبديل.
3. لا تخترع أي معلومة، ولا مصدرًا، ولا رقم حديث، ولا صفحة، ولا اسم كتاب، ولا درجة صحة.
4. لا تنسب حديثًا إلى النبي ﷺ ولا قولًا إلى صحابي إلا إذا كان المصدر مذكورًا صراحة في السياق.
5. لا تقدّم الرواية الضعيفة أو غير الموثقة كحقيقة قاطعة. وضّح درجة التوثيق كما وردت في السياق.
6. عند وجود اختلاف بين الروايات في السياق، اذكر ذلك بوضوح.
7. إذا كان السياق لا يحتوي معلومة كافية للإجابة، أجب بالعبارة الحرفية: "لا أملك في قاعدة المعرفة الحالية مصدرًا كافيًا للإجابة بدقة." ثم اقترح تجربة سؤال آخر مرتبط بالمحطة.
8. لا تُفتي، ولا تتحدث في أحكام شرعية إلا ضمن نطاق معرفي موثق ومصدره واضح.
9. إذا كان السؤال خارج نطاق السيرة والتاريخ الإسلامي، وضّح أنه خارج نطاق معرفتك.
10. في نهاية كل إجابة معرفية، اذكر المصدر كما ورد في السياق إن وُجد، بدرجة توثيقه، وبدون أي رابط لم يرد في السياق.

شكل الإجابة:
- نص الإجابة.
- ثم سطر: 📚 المصدر: (اسم المصدر إن وُجد)
- ثم سطر: 🔎 المرجع: (رقم الحديث/الصفحة/القسم إن وُجد)
- ثم سطر: حالة التوثيق: (موثق/صحيح/رواية تاريخية/يحتاج بيان/غير كافٍ)`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // المنصة عامة: لا نشترط تسجيل الدخول. نحاول قراءة المستخدم إن وُجد (لتحسين التخصيص).
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }

    let body;
    try { body = await req.json(); } catch { body = {}; }
    const question = (body.question || '').trim();
    const journeySlug = body.journey_slug || 'hijrah';
    const stageOrder = body.stage_order ?? null;
    const knowledgeLevel = body.knowledge_level || 'beginner';
    const language = ['ar', 'en', 'fr'].includes(body.language) ? body.language : 'ar';

    if (!question) {
      return Response.json({ error: 'السؤال مطلوب' }, { status: 400 });
    }

    // 1) الاسترجاع من قاعدة المعرفة الموثقة
    const allChunks = await base44.asServiceRole.entities.KnowledgeChunk.list('-created_date', 500);
    let pool = allChunks.filter((c) => c.journey_slug === journeySlug);
    if (stageOrder != null) {
      const stageChunks = pool.filter((c) => c.stage_order === stageOrder);
      if (stageChunks.length >= 3) pool = stageChunks;
    }
    const retrieved = retrieveChunks(pool, question, 5, 0.5);

    if (!retrieved.length) {
      const noAnswer = NO_MATCH_ANSWER[language] || NO_MATCH_ANSWER.ar;
      logRag(base44, { question, journey_slug: journeySlug, stage_order: stageOrder, retrieved_chunks: [], sources: [], answer: noAnswer, retrieval_status: 'no_match', confidence: 'none' });
      return Response.json({
        answer: noAnswer,
        sources: [],
        retrieved_chunks: [],
        retrieval_status: 'no_match',
        sufficient: false
      });
    }

    // 2) بناء السياق
    const context = buildContext(retrieved);
    const levelLine = LEVEL_GUIDE[knowledgeLevel] || LEVEL_GUIDE.beginner;
    const stageLine = stageOrder != null ? `المستخدم حاليًا في المحطة رقم ${stageOrder} من درب ${journeySlug}. اربط إجابتك بالمحطة عندما يكون مناسبًا.` : '';

    const langDirective = language === 'ar'
      ? "أجب بالعربية فقط."
      : `أجب ${LANG_LABEL[language]}. استثناءً من القاعدة 1: لغة الإجابة تكون ${LANG_LABEL[language]} لا العربية. ومع ذلك: احتفظ بأسماء المصادر والمراجع كما وردت حرفيًا في السياق (بالعربية الأصلية)، ولا تترجم أسماء الكتب أو أرقام الأحاديث أو النصوص المقتبسة. اشرح المعنى باللغة المطلوبة دون اختلاق اقتباسات مترجمة أو أدلة دينية غير موجودة في السياق.`;

    const prompt = `${SYSTEM_PROMPT}

${langDirective}

إرشادات المستوى: ${levelLine}
${stageLine}

سياق المعرفة الموثقة:
---
${context}
---

سؤال المستخدم: ${question}

أجب وفق القواعد الصارمة أعلاه. إن لم يكفِ السياق، استخدم العبارة المعلنة وفق القاعدة 7.`;

    // 3) التوليد المبني على المصدر
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          sufficient: { type: 'boolean' },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                reference: { type: 'string' },
                url: { type: 'string' },
                verification_status: { type: 'string' }
              }
            }
          }
        },
        required: ['answer', 'sufficient', 'sources']
      }
    });

    const data = llmRes || {};
    const answer = data.answer || 'تعذّر توليد إجابة.';
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const sufficient = data.sufficient !== false;

    // 4) تسجيل سجل RAG
    const chunkSummary = retrieved.map((c) => ({
      source_name: c.source_name,
      reference: c.reference,
      verification_status: c.verification_status,
      topic: c.topic,
      stage_order: c.stage_order
    }));
    logRag(base44, {
      question, journey_slug: journeySlug, stage_order: stageOrder,
      retrieved_chunks: chunkSummary,
      sources: sources.map((s) => s.name).filter(Boolean),
      answer, retrieval_status: 'found', confidence: sufficient ? 'high' : 'low'
    });

    return Response.json({
      answer,
      sources,
      retrieved_chunks: chunkSummary,
      retrieval_status: 'found',
      sufficient
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function logRag(base44, logData) {
  base44.asServiceRole.entities.RagLog.create(logData).catch(() => {});
}