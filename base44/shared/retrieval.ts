// طبقة استرجاع مجردة (Retrieval Abstraction)
// النسخة الحالية: استرجاع قائم على الكلمات المفتاحية (keyword retrieval) يدعم العربية.
// مصممة لاستبدالها لاحقًا بمزود embeddings خارجي عبر Secret دون تغيير بقية النظام.

const STOPWORDS = new Set([
  "من", "في", "على", "عن", "مع", "الى", "إلى", "إلي", "التي", "الذي", "الذين",
  "ما", "ماذا", "هل", "كم", "كيف", "اين", "أين", "متى", "لماذا", "هو", "هي",
  "هم", "هن", "كان", "كانت", "قد", "لقد", "ثم", "او", "أو", "و", "ف", "فـ",
  "لا", "لم", "لن", "إن", "أن", "اذا", "إذا", "هذا", "هذه", "ذلك", "تلك",
  "به", "بهذا", "فيه", "عليه", "لها", "به", "كل", "بعض", "عند", "عندما", "بعد",
  "قبل", "حيث", "حتى", "ال", "وقد", "وكان", "التي", "التى", "اي", "أي", "ايضا",
  "also", "the", "a", "an", "is", "are", "was", "were", "of", "in", "on", "to",
  "what", "who", "when", "where", "why", "how", "and", "or", "but"
]);

export function normalizeArabic(text) {
  if (!text) return "";
  return String(text)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // التشكيل والتطويل
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[،.,؛!?؟:"'(){}\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export function tokenize(text) {
  const normalized = normalizeArabic(text);
  if (!normalized) return [];
  return normalized
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

// تطبيع بسيط للجذور (light stemming) — يقلل البادئات واللواحق الشائعة
function lightStem(token) {
  let t = token;
  const prefixes = ["ال", "و", "ف", "ب", "ل", "ك"];
  for (const p of prefixes) {
    if (t.startsWith(p) && t.length - p.length > 3) t = t.slice(p.length);
  }
  const suffixes = ["ه", "ها", "هم", "هن", "نا", "كم", "كن", "ين", "ون", "ات", "يه", "ية"];
  for (const s of suffixes) {
    if (t.endsWith(s) && t.length - s.length > 3) t = t.slice(0, -s.length);
  }
  return t;
}

export function scoreChunk(chunk, queryTokens) {
  const rawText = `${chunk.chunk_text || ""} ${chunk.topic || ""} ${(chunk.keywords || []).join(" ")} ${chunk.source_name || ""}`;
  const chunkTokens = new Set(tokenize(rawText));
  const chunkStems = new Set([...chunkTokens].map(lightStem));
  let score = 0;
  for (const qt of queryTokens) {
    if (chunkTokens.has(qt)) { score += 2; continue; }
    const stem = lightStem(qt);
    if (chunkStems.has(stem)) { score += 1.2; continue; }
    for (const ct of chunkStems) {
      if (ct.length >= 4 && (ct.includes(stem) || stem.includes(ct))) { score += 0.5; break; }
    }
  }
  // مكافأة للقطع المرتبطة بالمرحلة الحالية
  return score;
}

export function retrieveChunks(chunks, question, topN = 5, minScore = 0.5) {
  const qTokens = tokenize(question);
  if (!qTokens.length) return [];
  const scored = chunks
    .map((c) => ({ chunk: c, score: scoreChunk(c, qTokens) }))
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.chunk);
}

export function buildContext(retrieved) {
  return retrieved
    .map((c, i) => {
      const parts = [`[مقتطف ${i + 1}]`];
      if (c.source_name) parts.push(`المصدر: ${c.source_name}`);
      if (c.reference) parts.push(`المرجع: ${c.reference}`);
      if (c.verification_status) parts.push(`درجة التوثيق: ${c.verification_status}`);
      parts.push(`المحتوى: ${c.chunk_text}`);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}