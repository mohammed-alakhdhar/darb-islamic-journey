import { Link } from 'react-router-dom';
import { ChevronLeft, MapPin } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useI18n } from '@/lib/i18n';
import { getStageVisual } from '@/lib/stageVisuals';

// رأس المحطة السينمائي: صورة خلفية فريدة لكل محطة + طبقة تدرّج داكنة + انتقال Fade & Zoom عند الفتح
export default function StageHero({ journeySlug, stageOrder, stageTitle, stageSubtitle, location }) {
  const { t } = useI18n();
  const visual = getStageVisual(stageOrder);

  return (
    <section className="relative overflow-hidden h-[50vh] min-h-[340px] sm:h-[56vh] sm:min-h-[420px]">
      {/* الصورة البيئية مع تأثير Fade + subtle zoom (Ken Burns) */}
      <Image
        src={visual.image}
        alt=""
        fittingType="fill"
        className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
      />
      {/* طبقة التدرّج الداكنة لضمان وضوح النص */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${visual.tint}, transparent 55%)` }} />
      {/* محتوى العنوان */}
      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col px-4 sm:px-6">
        <div className="pt-5">
          <Link
            to={`/journey/${journeySlug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-sm text-white/85 backdrop-blur-sm hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> {t('stage.mapLink')}
          </Link>
        </div>
        <div className="mt-auto pb-8 text-center animate-hero-rise">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            {t('stage.stageLabel')} {String(stageOrder).padStart(2, '0')}
          </div>
          <h1 className="font-display text-4xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-5xl">
            {stageTitle}
          </h1>
          {stageSubtitle && (
            <p className="mt-2 font-medium text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">{stageSubtitle}</p>
          )}
          {location && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/70">
              <MapPin className="h-4 w-4" /> {location}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}