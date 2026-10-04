import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Shield, Home as HomeIcon, Menu } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ xp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const links = [
    { to: '/', label: t('nav.home'), icon: HomeIcon },
    { to: '/journey/hijrah', label: t('nav.hijrah'), icon: Compass },
    { to: '/how-it-works', label: t('nav.how'), icon: Sparkles },
    { to: '/admin', label: t('nav.admin'), icon: Shield }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-darb text-darb-cream font-display text-lg font-bold shadow-soft">د</span>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold text-foreground">دَرْب</div>
              <div className="text-[10px] text-muted-foreground tracking-wide">{t('brand.tagline')}</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {typeof xp === 'number' && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-darb-gold/40 bg-darb-gold/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-darb-gold" />
                <span className="text-sm font-bold text-foreground">{xp}</span>
                <span className="text-xs text-muted-foreground">XP</span>
              </div>
            )}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <button
              className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground"
              onClick={() => setOpen((o) => !o)}
              aria-label={t('nav.menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden pb-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60"
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <LanguageSwitcher compact />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}