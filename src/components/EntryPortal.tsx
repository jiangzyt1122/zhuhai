import React from 'react';
import { ArrowRight, BookOpen, Compass, Egg } from 'lucide-react';

interface EntryPortalProps {
  onOpenEnglish: () => void;
  onOpenExplore: () => void;
  chickenFarmHref: string;
}

const portalSections = [
  {
    id: 'english',
    title: '英语学习',
    subtitle: 'English Learning',
    description: '单词、短句、开口表达',
    accent: 'from-[#f59e0b] via-[#f97316] to-[#ef4444]',
    text: 'text-amber-50',
    border: 'border-white/20',
    icon: BookOpen
  },
  {
    id: 'explore',
    title: '地图探索',
    subtitle: 'POI Explore',
    description: '进入现有地图、POI 和详情',
    accent: 'from-[#0f766e] via-[#0f766e] to-[#1d4ed8]',
    text: 'text-cyan-50',
    border: 'border-white/15',
    icon: Compass
  },
  {
    id: 'chicken',
    title: '开心小鸡农场',
    subtitle: 'Happy Chicken Farm',
    description: '孵蛋、散步、滑梯和秋千',
    accent: 'from-[#f59e0b] via-[#84cc16] to-[#16a34a]',
    text: 'text-lime-50',
    border: 'border-white/20',
    icon: Egg
  }
] as const;

export const EntryPortal: React.FC<EntryPortalProps> = ({
  onOpenEnglish,
  onOpenExplore,
  chickenFarmHref
}) => {
  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#020617_0%,_#111827_42%,_#0f172a_100%)]" />
      <div className="portal-ambient" />
      <div className="portal-grid" />
      <div className="portal-orb portal-orb-one" />
      <div className="portal-orb portal-orb-two" />
      <div className="portal-orb portal-orb-three" />

      <div className="relative z-10 flex min-h-dvh flex-col justify-center px-4 py-5 sm:px-6 sm:py-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            Choose Your Entry
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            一个入口页，三个方向
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            英语、地图和小鸡农场，从这里出发。
          </p>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-6xl flex-1 items-center">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
            {portalSections.map((section) => {
              const Icon = section.icon;
              const onClick = section.id === 'english' ? onOpenEnglish : onOpenExplore;
              const cardClassName = `group relative min-h-[170px] overflow-hidden rounded-[1.5rem] border ${section.border} bg-white/5 p-4 text-left backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 sm:min-h-[280px] sm:rounded-[2rem] sm:p-6`;
              const cardContent = (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.accent} opacity-80`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.45),_transparent_40%)]" />

                  <div className={`relative flex h-full flex-col justify-between ${section.text}`}>
                    <div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 ring-1 ring-white/20 sm:h-14 sm:w-14">
                        <Icon size={22} strokeWidth={2.2} />
                      </div>
                      <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/70 sm:mt-5 sm:text-xs">
                        {section.subtitle}
                      </p>
                      <h2 className="mt-2 text-xl font-black leading-tight sm:text-3xl">
                        {section.title}
                      </h2>
                      <p className="mt-2 max-w-[18rem] text-xs leading-5 text-white/85 sm:mt-3 sm:text-sm sm:leading-6">
                        {section.description}
                      </p>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold sm:mt-6 sm:text-base">
                      <span>进入</span>
                      <ArrowRight
                        size={18}
                        className="transition duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </>
              );

              if (section.id === 'chicken') {
                return (
                  <a
                    key={section.id}
                    href={chickenFarmHref}
                    className={cardClassName}
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={onClick}
                  className={cardClassName}
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
