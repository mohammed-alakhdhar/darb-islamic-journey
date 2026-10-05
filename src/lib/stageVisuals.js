// بيانات البصريات لكل محطة من درب الهجرة — صورة خلفية فريدة + تدرّج لوني يعكس الحدث والمكان
// لا تُظهر أي شخصيات مقدسة، بل الأماكن والبيئة والرموز التاريخية فقط.
export const STAGE_VISUALS = {
  1: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/d7660ba32_generated_image.png',
    tint: 'rgba(40,24,8,0.30)',
    accent: 'amber'
  },
  2: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/c8538ac7b_generated_image.png',
    tint: 'rgba(8,12,30,0.40)',
    accent: 'indigo'
  },
  3: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/94a419fa4_generated_image.png',
    tint: 'rgba(10,18,30,0.40)',
    accent: 'slate'
  },
  4: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/9ac5cb6d1_generated_image.png',
    tint: 'rgba(30,18,8,0.38)',
    accent: 'amber'
  },
  5: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/8f845b25e_generated_image.png',
    tint: 'rgba(40,28,10,0.30)',
    accent: 'gold'
  },
  6: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/53eab6a0c_generated_image.png',
    tint: 'rgba(35,18,8,0.36)',
    accent: 'orange'
  },
  7: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/67e92b2e5_generated_image.png',
    tint: 'rgba(40,20,8,0.36)',
    accent: 'orange'
  },
  8: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/c9db26aab_generated_image.png',
    tint: 'rgba(10,30,18,0.32)',
    accent: 'emerald'
  },
  9: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/b212e9051_generated_image.png',
    tint: 'rgba(20,30,12,0.32)',
    accent: 'emerald'
  },
  10: {
    image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/760586b4e_generated_image.png',
    tint: 'rgba(10,28,14,0.32)',
    accent: 'emerald'
  }
};

const DEFAULT_VISUAL = {
  image: 'https://media.base44.com/images/public/6ac2429ee90f4ed4937908c4/d7660ba32_generated_image.png',
  tint: 'rgba(10,13,34,0.40)',
  accent: 'amber'
};

export function getStageVisual(order) {
  return STAGE_VISUALS[order] || DEFAULT_VISUAL;
}