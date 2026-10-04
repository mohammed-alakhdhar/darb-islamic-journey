import { Sparkles, Award } from 'lucide-react';

export default function XPBar({ xp, completed, total, badges = [] }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-darb-gold/15 text-darb-gold">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">نقاط الخبرة</div>
            <div className="font-display text-lg font-bold text-foreground leading-none">{xp} XP</div>
          </div>
        </div>
        {badges.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-darb-gold" />
            <span className="text-sm font-semibold text-foreground">{badges.length}</span>
            <span className="text-xs text-muted-foreground">شارة</span>
          </div>
        )}
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>تقدّم الرحلة</span>
            <span>{completed} / {total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-darb-gold to-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}