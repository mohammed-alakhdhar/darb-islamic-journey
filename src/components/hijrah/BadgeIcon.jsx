import { Award, Book, Compass, Sunrise, Mountain, Route, Shield, Sprout, Tent, Wind } from 'lucide-react';

const MAP = {
  award: Award,
  book: Book,
  compass: Compass,
  horizon: Sunrise,
  mountain: Mountain,
  route: Route,
  shield: Shield,
  sprout: Sprout,
  tent: Tent,
  wind: Wind
};

export default function BadgeIcon({ name, className }) {
  const Icon = MAP[name] || Award;
  return <Icon className={className} />;
}