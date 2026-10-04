import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n, LANGUAGES } from '@/lib/i18n';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const choose = (code) => {
    setLang(code);
    setOpen(false);
  };

  if (compact) {
    // نسخة الجوال: قائمة منسدلة مدمجة
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={current.label}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span>{current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {open && (
          <ul role="listbox" className="absolute end-0 mt-1 w-40 rounded-xl border border-border bg-card shadow-lift overflow-hidden z-50">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => choose(l.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    l.code === lang ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span>{l.label}</span>
                  {l.code === lang && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // نسخة سطح المكتب: شريط أفقي العربية | English | Français
  return (
    <div className="flex items-center rounded-full border border-border bg-card/70 p-0.5" role="group" aria-label="Language">
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            onClick={() => choose(l.code)}
            aria-pressed={active}
            aria-label={l.label}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {l.label}
          </button>
        );
      })}
    </div>
  );
}