import React from 'react';
import { Profile, THEMES, ThemeType } from '../types';
import { Mail, Phone, MapPin, Github, Linkedin, Globe, Award, Briefcase, GraduationCap, ShieldAlert, EyeOff } from 'lucide-react';

interface ResumeDocumentProps {
  profile: Profile;
  themeType: ThemeType;
  layout: 'classic' | 'executive' | 'creative' | 'swiss' | 'tech';
  timelineStyle?: 'none' | 'solid' | 'dashed';
  resumeCompactness?: 'compact' | 'normal' | 'relaxed';
  showAvatarBlock?: boolean;
  hiddenSections?: string[];
  onToggleSectionVisibility?: (sectionId: string) => void;
}

export default function ResumeDocument({
  profile,
  themeType,
  layout,
  timelineStyle = 'dashed',
  resumeCompactness = 'normal',
  showAvatarBlock = true,
  hiddenSections = [],
  onToggleSectionVisibility
}: ResumeDocumentProps) {
  const currentTheme = THEMES[themeType] || THEMES.swiss;
  const isDark = themeType === 'luxury' || themeType === 'tech';

  const textHeadingClass = isDark ? 'text-neutral-100' : 'text-neutral-900';
  const textSubheadingClass = isDark ? 'text-neutral-300' : 'text-neutral-800';
  const textMutedClass = isDark ? 'text-neutral-400' : 'text-neutral-500';
  const cardBgClass = isDark ? 'bg-slate-950/40' : 'bg-white';
  const bentoContactsBgClass = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-neutral-200/60';

  const compactness = resumeCompactness || 'normal';
  const mbClass = compactness === 'compact' ? 'mb-2' : compactness === 'relaxed' ? 'mb-6' : 'mb-4';
  const blockMbClass = compactness === 'compact' ? 'mb-3' : compactness === 'relaxed' ? 'mb-8' : 'mb-6';
  const spaceYClass = compactness === 'compact' ? 'space-y-1.5' : compactness === 'relaxed' ? 'space-y-4' : 'space-y-3';
  const bulletSpaceYClass = compactness === 'compact' ? 'space-y-0.5' : compactness === 'relaxed' ? 'space-y-1.5' : 'space-y-1';
  const textScaleClass = compactness === 'compact' ? 'text-[11px]' : compactness === 'relaxed' ? 'text-[12.5px]' : 'text-xs';

  const getSectionTitle = (key: 'skills' | 'experience' | 'projects' | 'education' | 'achievements', defaultTitle: string) => {
    if (profile.sectionNames && profile.sectionNames[key]) {
      return profile.sectionNames[key];
    }
    return defaultTitle;
  };

  const getHideButton = (sectionId: string) => {
    if (!onToggleSectionVisibility) return null;
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSectionVisibility(sectionId);
        }}
        className="absolute top-1 right-1 z-20 opacity-0 group-hover/section:opacity-100 transition duration-150 py-0.5 px-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-600 font-sans text-[8.5px] flex items-center gap-1 no-print shadow-sm cursor-pointer pointer-events-auto"
        title="双击或点击此按钮不展示此板块"
      >
        <EyeOff className="w-2.5 h-2.5 text-red-400 shrink-0" />
        <span>隐藏此板块</span>
      </button>
    );
  };

  // Helpers to render icons
  const contactIcons = {
    email: <Mail className="w-3.5 h-3.5" />,
    phone: <Phone className="w-3.5 h-3.5" />,
    location: <MapPin className="w-3.5 h-3.5" />,
    github: <Github className="w-3.5 h-3.5" />,
    linkedin: <Linkedin className="w-3.5 h-3.5" />,
    website: <Globe className="w-3.5 h-3.5" />
  };

  // Modern highlighting for numbers, percentages, speed metrics e.g. "x%", "+%" and multi-line, 2-level directory indentation.
  const formatBullet = (text: string) => {
    const lines = text.split('\n');
    const highlightRegex = /(\*\*.*?\*\*|\d+%|\d+\.\d+s|\d+、?\d*?\+?万|\d+倍|\d+ms|QPS|SaaS|SSR|ISR|FCP|Top\s?\d+%?)/g;

    const renderTextWithHighlights = (rawText: string) => {
      const parts = rawText.split(highlightRegex);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className={`font-semibold ${currentTheme.accent} print-heavy`}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (highlightRegex.test(part)) {
          return (
            <strong key={index} className={`font-bold ${currentTheme.accent} print-heavy`}>
              {part}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      });
    };

    if (lines.length === 1) {
      return renderTextWithHighlights(text);
    }

    return (
      <span className="block">
        <span>{renderTextWithHighlights(lines[0])}</span>
        <span className="block space-y-1 mt-1 pl-1">
          {lines.slice(1).map((line, lineIdx) => {
            const isSub = /^\s*[-*•]\s+/.test(line) || /^\s+/.test(line);
            const cleanLine = line.replace(/^\s*[-*•]\s+/, '').trim();
            
            if (!cleanLine) return null;

            if (isSub) {
              return (
                <span key={lineIdx} className="block pl-3.5 flex items-baseline gap-1.5 text-[0.95em] text-neutral-600">
                  <span className="w-1 h-1 rounded-full bg-current opacity-40 shrink-0"></span>
                  <span className="leading-normal">{renderTextWithHighlights(cleanLine)}</span>
                </span>
              );
            } else {
              return (
                <span key={lineIdx} className="block pl-3.5 leading-normal text-[0.95em] text-neutral-600">
                  {renderTextWithHighlights(cleanLine)}
                </span>
              );
            }
          })}
        </span>
      </span>
    );
  };

  // Helper inside layout structures for standard parts list
  const getHeaderSection = () => {
    return (
      <div className={`${mbClass} pb-4 border-b ${currentTheme.border}`}>
        <div className={`flex flex-row justify-between items-center gap-6 ${textHeadingClass}`}>
          <div className="flex items-center gap-4">
            {showAvatarBlock && (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl uppercase tracking-wider relative shrink-0 ${currentTheme.accentBg} ${currentTheme.accent} border-2 ${currentTheme.accentBorder}`}>
                <span className="relative z-10">{profile.name ? profile.name.slice(0, 1) : 'CV'}</span>
                <span className="absolute -inset-0.5 rounded-xl bg-current opacity-5 animate-pulse"></span>
              </div>
            )}
            <div>
              <h1 className={`text-3.5xl font-extrabold tracking-tight mb-1 ${currentTheme.fontSerif}`}>
                {profile.name}
              </h1>
              <p className={`text-xs font-semibold tracking-wide ${currentTheme.accent}`}>
                {profile.title}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-90 max-w-sm shrink-0">
            <div className="flex items-center gap-1.5">
              <span className={currentTheme.accent}>{contactIcons.location}</span>
              <span>{profile.contact.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={currentTheme.accent}>{contactIcons.email}</span>
              <span className="break-all">{profile.contact.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={currentTheme.accent}>{contactIcons.phone}</span>
              <span>{profile.contact.phone}</span>
            </div>
            {profile.contact.github && (
              <div className="flex items-center gap-1.5">
                <span className={currentTheme.accent}>{contactIcons.github}</span>
                <span className="truncate">{profile.contact.github}</span>
              </div>
            )}
            {profile.contact.linkedin && (
              <div className="flex items-center gap-1.5">
                <span className={currentTheme.accent}>{contactIcons.linkedin}</span>
                <span className="truncate">{profile.contact.linkedin}</span>
              </div>
            )}
            {profile.contact.website && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className={currentTheme.accent}>{contactIcons.website}</span>
                <span className="truncate">{profile.contact.website}</span>
              </div>
            )}
          </div>
        </div>
        {profile.summary && (
          <p className="mt-3 text-xs leading-relaxed opacity-85 text-justify">
            {profile.summary}
          </p>
        )}
      </div>
    );
  };

  const getSkillsBlock = () => {
    if (hiddenSections.includes('skills')) return null;
    if (!profile.skills || profile.skills.length === 0) return null;
    return (
      <div className={`${mbClass} relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/20 dark:hover:bg-slate-800/15`}>
        {getHideButton('skills')}
        <h2 className={`text-xs font-bold tracking-widest uppercase mb-2 ${currentTheme.accent} flex items-center gap-1.5`}>
          <span>专业技能</span>
        </h2>
        <div className="grid grid-cols-1 gap-1.5 pt-0.5">
          {profile.skills.map((skillGroup, index) => (
            <div key={index} className={`${textScaleClass} flex flex-row items-start gap-1`}>
              <span className="font-bold opacity-90 w-28 shrink-0">{skillGroup.category}:</span>
              <div className="flex-1 space-y-1">
                {skillGroup.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="opacity-80 leading-normal flex items-baseline gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-current opacity-40 shrink-0"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getExperienceBlock = () => {
    if (hiddenSections.includes('experience')) return null;
    if (!profile.experience || profile.experience.length === 0) return null;
    
    const isTimelineEnabled = timelineStyle !== 'none';
    const borderStyle = timelineStyle === 'dashed' ? 'border-dashed' : 'border-solid';
    
    return (
      <div className={`${blockMbClass} relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/20 dark:hover:bg-slate-800/15`}>
        {getHideButton('experience')}
        <h2 className={`text-sm font-bold tracking-wider uppercase mb-3 ${currentTheme.accent} pb-1 border-b ${currentTheme.border} flex items-center gap-1.5`}>
          <Briefcase className="w-4 h-4" />
          <span>{getSectionTitle('experience', '工作经历')}</span>
        </h2>
        <div className={`space-y-4 ${isTimelineEnabled ? 'relative pl-5 ml-1 border-l-2 ' + currentTheme.border + ' ' + borderStyle : ''}`}>
          {profile.experience.map((exp, expIdx) => (
            <div key={exp.id} className={`${textScaleClass} group relative ${isTimelineEnabled && expIdx !== profile.experience.length - 1 ? 'pb-2' : ''}`}>
              {/* Timeline Connector Dot */}
              {isTimelineEnabled && (
                <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border-2 ${currentTheme.border} ${isDark ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center transition group-hover:scale-125 z-10`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-current ${currentTheme.accent}`}></span>
                </span>
              )}
              <div className="flex flex-row justify-between items-baseline mb-1">
                <div className="flex-1 flex items-baseline gap-2">
                  <span className="opacity-95 text-sm font-bold w-48 shrink-0 truncate" title={exp.company}>{exp.company}</span>
                  <span className={`font-semibold text-xs ${currentTheme.accent} truncate flex-1`} title={exp.role}>{exp.role}</span>
                </div>
                <div className="flex items-center text-[10px] opacity-75 font-mono shrink-0 pl-2">
                  <span>{exp.period}</span>
                </div>
              </div>
              <ul className={`list-disc list-outside ml-4 ${bulletSpaceYClass} opacity-85 leading-relaxed text-justify`}>
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx} className="marker:text-neutral-400">
                    {formatBullet(bullet)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getProjectsBlock = () => {
    if (hiddenSections.includes('projects')) return null;
    if (!profile.projects || profile.projects.length === 0) return null;
    
    const isTimelineEnabled = timelineStyle !== 'none';
    const borderStyle = timelineStyle === 'dashed' ? 'border-dashed' : 'border-solid';

    return (
      <div className={`${blockMbClass} relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/20 dark:hover:bg-slate-800/15`}>
        {getHideButton('projects')}
        <h2 className={`text-sm font-bold tracking-wider uppercase mb-3 ${currentTheme.accent} pb-1 border-b ${currentTheme.border} flex items-center gap-1.5`}>
          <Briefcase className="w-4.5 h-4.5" />
          <span>{getSectionTitle('projects', '项目经历')}</span>
        </h2>
        <div className={`space-y-4 ${isTimelineEnabled ? 'relative pl-5 ml-1 border-l-2 ' + currentTheme.border + ' ' + borderStyle : ''}`}>
          {profile.projects.map((proj, projIdx) => (
            <div key={proj.id} className={`${textScaleClass} group relative ${isTimelineEnabled && projIdx !== profile.projects.length - 1 ? 'pb-2' : ''}`}>
              {/* Timeline Connector Dot */}
              {isTimelineEnabled && (
                <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border-2 ${currentTheme.border} ${isDark ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center transition group-hover:scale-125 z-10`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-current ${currentTheme.accent}`}></span>
                </span>
              )}
              <div className="flex flex-row justify-between items-baseline gap-2 mb-1">
                <div className="font-bold text-sm flex flex-wrap items-center gap-2">
                  <span className="opacity-95 text-sm">{proj.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-30"></span>
                  <span className={`font-semibold text-xs ${currentTheme.accent}`}>{proj.role}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-75 font-mono shrink-0">
                  <span>{proj.period}</span>
                  {proj.link && (
                    <>
                      <span>|</span>
                      <span className="underline break-all text-[10px]">{proj.link}</span>
                    </>
                  )}
                </div>
              </div>
              <ul className={`list-disc list-outside ml-4 ${bulletSpaceYClass} opacity-85 leading-relaxed text-justify`}>
                {proj.bullets.map((bullet, idx) => (
                  <li key={idx} className="marker:text-neutral-400">
                    {formatBullet(bullet)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getEducationBlock = () => {
    if (hiddenSections.includes('education')) return null;
    if (!profile.education || profile.education.length === 0) return null;
    return (
      <div className={`${blockMbClass} relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/20 dark:hover:bg-slate-800/15`}>
        {getHideButton('education')}
        <h2 className={`text-sm font-bold tracking-wider uppercase mb-3 ${currentTheme.accent} pb-1 border-b ${currentTheme.border} flex items-center gap-1.5`}>
          <GraduationCap className="w-4.5 h-4.5" />
          <span>{getSectionTitle('education', '教育背景')}</span>
        </h2>
        <div className={spaceYClass}>
          {profile.education.map((edu) => (
            <div key={edu.id} className={textScaleClass}>
              <div className="flex flex-row justify-between items-baseline gap-2 mb-1">
                <div className="font-bold text-sm flex flex-wrap items-center gap-1.5">
                  <span>{edu.school}</span>
                  <span className={`font-medium text-xs ${currentTheme.accent}`}>
                    ({edu.degree} · {edu.major})
                  </span>
                </div>
                <div className="text-[10px] opacity-75 font-mono shrink-0">{edu.period}</div>
              </div>
              {edu.bullets && edu.bullets.map((b, idx) => (
                <p key={idx} className="opacity-80 pl-2 border-l border-neutral-300 leading-relaxed text-justify">
                  {b}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getAchievementsBlock = () => {
    if (hiddenSections.includes('achievements')) return null;
    if (!profile.achievements || profile.achievements.length === 0) return null;
    return (
      <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/20 dark:hover:bg-slate-800/15">
        {getHideButton('achievements')}
        <h2 className={`text-sm font-bold tracking-wider uppercase mb-3 ${currentTheme.accent} pb-1 border-b ${currentTheme.border} flex items-center gap-1.5`}>
          <Award className="w-4 h-4" />
          <span>{getSectionTitle('achievements', '成就荣誉')}</span>
        </h2>
        <ul className="list-disc list-outside ml-4 space-y-1 text-xs opacity-85 leading-relaxed text-justify">
          {profile.achievements.map((ach, idx) => (
            <li key={idx} className="marker:text-neutral-400">
              {formatBullet(ach)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Switch structure based on layouts
  const renderLayoutContent = () => {
    switch (layout) {
      case 'swiss':
        return (
          <div className="flex flex-col h-auto min-h-full">
            {getHeaderSection()}
            <div className="grid grid-cols-4 gap-6 mt-4 flex-grow">
              {/* Left timeline column for layout grids */}
              <div className="col-span-1 space-y-6">
                {!hiddenSections.includes('skills') && profile.skills && profile.skills.length > 0 && (
                  <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/20 dark:hover:bg-slate-800/15">
                    {getHideButton('skills')}
                    <h3 className={`text-xs font-bold tracking-wider mb-2 uppercase ${currentTheme.accent}`}>
                      {getSectionTitle('skills', '技术专长')}
                    </h3>
                    <div className="space-y-3">
                      {profile.skills.map((grp, idx) => (
                        <div key={idx} className="text-[11px]">
                          <div className="font-semibold mb-1 opacity-90">{grp.category}</div>
                          <div className="space-y-1">
                            {grp.items.map((item, itemIdx) => (
                              <span key={itemIdx} className={`px-1.5 py-0.5 rounded-sm text-[9px] ${currentTheme.labelBg} block w-fit`}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Correct wide narrative right column */}
              <div className="col-span-3 space-y-6">
                {getExperienceBlock()}
                {getProjectsBlock()}
                <div className="grid grid-cols-1 gap-6">
                  {getEducationBlock()}
                  {getAchievementsBlock()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tech':
        return (
          <div className="flex flex-col h-auto min-h-full font-mono text-[11px] leading-relaxed">
            {/* Header in raw ASCII-style borders */}
            <div className={`border-2 ${currentTheme.border} p-4 mb-5 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] bg-red-600 text-white font-bold no-print">
                STRICT_MONO_MODE
              </div>
              <div className="flex flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
                  <p className={`text-xs mt-1 ${currentTheme.accent}`}>{`> ${profile.title}`}</p>
                </div>
                <div className="space-y-1 text-[10px] text-right shrink-0">
                  <div>[LOC] {profile.contact.location}</div>
                  <div>[TXT] {profile.contact.phone}</div>
                  <div>[EML] {profile.contact.email}</div>
                  {profile.contact.github && <div>[GHB] {profile.contact.github}</div>}
                </div>
              </div>
              {!hiddenSections.includes('summary') && profile.summary && (
                <div className={`mt-3 pt-3 border-t border-dashed ${currentTheme.border} text-[10px] opacity-85 text-justify relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-105/10`}>
                  {getHideButton('summary')}
                  {profile.summary}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Unified block sections */}
              {!hiddenSections.includes('skills') && profile.skills && profile.skills.length > 0 && (
                <div className={`border ${currentTheme.border} p-3 relative group/section`}>
                  {getHideButton('skills')}
                  <div className={`font-bold mb-2 ${currentTheme.accent}`}># {getSectionTitle('skills', '技术专长')}</div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    {profile.skills.map((grp, idx) => (
                      <div key={idx}>
                        <div className="font-bold text-gray-400 mb-1">[{grp.category}]</div>
                        <ul className="space-y-0.5 opacity-90 pl-1 list-none">
                          {grp.items.map((item, itemIdx) => (
                            <li key={itemIdx}>{`• ${item}`}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hiddenSections.includes('experience') && profile.experience && profile.experience.length > 0 && (
                <div className={`border ${currentTheme.border} p-3 relative group/section`}>
                  {getHideButton('experience')}
                  <div className={`font-bold mb-3 ${currentTheme.accent}`}># {getSectionTitle('experience', '工作经历')}</div>
                  <div className="space-y-4">
                    {profile.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-bold text-gray-200">
                          <div className="flex-1 flex items-baseline gap-2">
                            <span className="w-48 shrink-0 truncate">{`* ${exp.company}`}</span>
                            <span className={`text-[11px] font-semibold ${currentTheme.accent} truncate flex-1`}>{exp.role}</span>
                          </div>
                          <div className="opacity-75 shrink-0 pl-2">{exp.period}</div>
                        </div>
                        <div className="pl-3 mt-1 space-y-1 text-[11px] text-justify">
                          {exp.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="opacity-90 flex items-start gap-1">
                              <span>-</span>
                              <span>{formatBullet(bullet)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hiddenSections.includes('projects') && profile.projects && profile.projects.length > 0 && (
                <div className={`border ${currentTheme.border} p-3 relative group/section`}>
                  {getHideButton('projects')}
                  <div className={`font-bold mb-3 ${currentTheme.accent}`}># {getSectionTitle('projects', '项目经历')}</div>
                  <div className="space-y-4">
                    {profile.projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between font-bold text-gray-200">
                          <div>{`* ${proj.name}`}</div>
                          <div className="opacity-75">{proj.period}</div>
                        </div>
                        <div className="text-[10px] opacity-70 mb-1 pl-3 font-semibold">[ROLE] {proj.role} {proj.link ? `| [URI] ${proj.link}` : ''}</div>
                        <div className="pl-3 space-y-1 text-justify">
                          {proj.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="opacity-90 flex items-start gap-1">
                              <span>-</span>
                              <span>{formatBullet(bullet)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {!hiddenSections.includes('education') && profile.education && profile.education.length > 0 && (
                  <div className={`border ${currentTheme.border} p-3 relative group/section`}>
                    {getHideButton('education')}
                    <div className={`font-bold mb-2 ${currentTheme.accent}`}># {getSectionTitle('education', '教育背景')}</div>
                    <div className="space-y-2">
                      {profile.education.map((edu) => (
                        <div key={edu.id}>
                          <div className="font-bold text-gray-200">{edu.school}</div>
                          <div className="text-[10px] opacity-80">{edu.degree} - {edu.major} ({edu.period})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!hiddenSections.includes('achievements') && profile.achievements && profile.achievements.length > 0 && (
                  <div className={`border ${currentTheme.border} p-3 relative group/section`}>
                    {getHideButton('achievements')}
                    <div className={`font-bold mb-2 ${currentTheme.accent}`}># {getSectionTitle('achievements', '荣誉奖项')}</div>
                    <div className="space-y-1">
                      {profile.achievements.map((ach, idx) => (
                        <div key={idx} className="opacity-90 flex items-start gap-1 leading-normal text-justify">
                          <span>-</span>
                          <span>{formatBullet(ach)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'executive':
        // Elite Executive Single-Column layout (perfectly centered, elegant serif titles, precise vertical spacing, formal headers)
        return (
          <div className="flex flex-col h-auto min-h-full space-y-6">
            {/* Centered Elite Header */}
            <div className={`text-center pb-5 border-b-2 ${currentTheme.border}`}>
              <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${currentTheme.fontSerif}`}>
                {profile.name}
              </h1>
              <p className={`text-sm font-semibold tracking-widest uppercase mb-3 ${currentTheme.accent}`}>
                {profile.title}
              </p>
              
              {/* Horizontal inline contact bar */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs opacity-90">
                <div className="flex items-center gap-1.5">
                  <span className={currentTheme.accent}>{contactIcons.location}</span>
                  <span>{profile.contact.location}</span>
                </div>
                <span className="opacity-30 select-none hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className={currentTheme.accent}>{contactIcons.email}</span>
                  <span className="break-all">{profile.contact.email}</span>
                </div>
                <span className="opacity-30 select-none hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className={currentTheme.accent}>{contactIcons.phone}</span>
                  <span>{profile.contact.phone}</span>
                </div>
                {profile.contact.github && (
                  <>
                    <span className="opacity-30 select-none hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className={currentTheme.accent}>{contactIcons.github}</span>
                      <span>{profile.contact.github}</span>
                    </div>
                  </>
                )}
                {profile.contact.linkedin && (
                  <>
                    <span className="opacity-30 select-none hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className={currentTheme.accent}>{contactIcons.linkedin}</span>
                      <span>{profile.contact.linkedin}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Centered Professional Summary */}
            {!hiddenSections.includes('summary') && profile.summary && (
              <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/10 dark:hover:bg-slate-800/10">
                {getHideButton('summary')}
                <div className="text-center max-w-2xl mx-auto py-1 px-4 text-xs leading-relaxed opacity-90 italic">
                  {profile.summary}
                </div>
              </div>
            )}

            {/* Main Single Column Flow */}
            <div className="space-y-6">
              {/* Specialized Skills Section for Executive */}
              {!hiddenSections.includes('skills') && profile.skills && profile.skills.length > 0 && (
                <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/10 dark:hover:bg-slate-800/10">
                  {getHideButton('skills')}
                  <h2 className={`text-xs font-bold tracking-widest uppercase mb-2 ${currentTheme.accent} pb-0.5 border-b ${currentTheme.border}`}>
                    <span>{getSectionTitle('skills', '技术专长与核心竞争力')}</span>
                  </h2>
                  <div className="space-y-1.5 pt-0.5">
                    {profile.skills.map((grp, idx) => (
                      <div key={idx} className="text-xs flex flex-row items-start gap-1 py-1">
                        <span className="font-bold w-32 shrink-0 opacity-90">{grp.category}:</span>
                        <div className="flex-1 space-y-1">
                          {grp.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="opacity-80 leading-normal flex items-baseline gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-current opacity-40 shrink-0"></span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {!hiddenSections.includes('experience') && profile.experience && profile.experience.length > 0 && (
                <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/10 dark:hover:bg-slate-800/10">
                  {getHideButton('experience')}
                  <h2 className={`text-xs font-bold tracking-widest uppercase mb-3 ${currentTheme.accent} pb-0.5 border-b ${currentTheme.border}`}>
                    <span>{getSectionTitle('experience', '工作履历与任职履历')}</span>
                  </h2>
                  <div className={`space-y-4 ${timelineStyle !== 'none' ? 'relative pl-5 ml-1 border-l-2 ' + currentTheme.border + ' ' + (timelineStyle === 'dashed' ? 'border-dashed' : 'border-solid') : ''}`}>
                    {profile.experience.map((exp, expIdx) => (
                      <div key={exp.id} className={`text-xs group relative ${timelineStyle !== 'none' && expIdx !== profile.experience.length - 1 ? 'pb-2' : ''}`}>
                        {/* Timeline Connector Dot */}
                        {timelineStyle !== 'none' && (
                          <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border-2 ${currentTheme.border} ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white'} flex items-center justify-center transition group-hover:scale-125 z-10`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current ${currentTheme.accent}`}></span>
                          </span>
                        )}
                        <div className="flex justify-between items-baseline mb-1">
                           <div className="flex-1 flex items-baseline gap-2">
                            <span className={`font-bold text-sm ${textHeadingClass} w-48 shrink-0 truncate`} title={exp.company}>{exp.company}</span>
                             <span className={`font-semibold text-xs ${currentTheme.accent} truncate flex-1`} title={exp.role}>{exp.role}</span>
                           </div>
                           <div className="text-[11px] font-mono opacity-80 shrink-0 pl-2">{exp.period}</div>
                        </div>
                        <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 opacity-85 leading-relaxed text-justify">
                           {exp.bullets.map((bullet, idx) => (
                             <li key={idx}>
                                {formatBullet(bullet)}
                             </li>
                           ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {!hiddenSections.includes('projects') && profile.projects && profile.projects.length > 0 && (
                <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/10 dark:hover:bg-slate-800/10">
                  {getHideButton('projects')}
                  <h2 className={`text-xs font-bold tracking-widest uppercase mb-3 ${currentTheme.accent} pb-0.5 border-b ${currentTheme.border}`}>
                    <span>{getSectionTitle('projects', '核心项目与产出')}</span>
                  </h2>
                  <div className="space-y-4">
                    {profile.projects.map((proj) => (
                      <div key={proj.id} className="text-xs">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${textHeadingClass}`}>{proj.name}</span>
                            <span className="opacity-30 text-[10px]">•</span>
                            <span className="font-medium text-xs opacity-80">{proj.role}</span>
                          </div>
                          <div className="text-[11px] font-mono opacity-85">
                            {proj.period} {proj.link && `| ${proj.link}`}
                          </div>
                        </div>
                        <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 opacity-85 leading-relaxed text-justify">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx}>
                              {formatBullet(bullet)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Achievements in side-by-side equal grid columns */}
              <div className="grid grid-cols-2 gap-6 pt-1">
                {!hiddenSections.includes('education') && profile.education && profile.education.length > 0 && (
                  <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/10 dark:hover:bg-slate-800/10">
                    {getHideButton('education')}
                    <h2 className={`text-xs font-bold tracking-widest uppercase mb-2 ${currentTheme.accent} pb-0.5 border-b ${currentTheme.border}`}>
                      <span>{getSectionTitle('education', '学术背景')}</span>
                    </h2>
                    <div className="space-y-2">
                      {profile.education.map((edu) => (
                        <div key={edu.id} className="text-xs">
                          <div className={`font-bold ${textHeadingClass}`}>{edu.school}</div>
                          <div className="opacity-80 mt-0.5">{edu.degree} · {edu.major} ({edu.period})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hiddenSections.includes('achievements') && profile.achievements && profile.achievements.length > 0 && (
                  <div className="relative group/section pl-1.5 pr-2 -ml-1.5 -mr-2 rounded transition hover:bg-neutral-100/10 dark:hover:bg-slate-800/10">
                    {getHideButton('achievements')}
                    <h2 className={`text-xs font-bold tracking-widest uppercase mb-2 ${currentTheme.accent} pb-0.5 border-b ${currentTheme.border}`}>
                      <span>{getSectionTitle('achievements', '荣誉奖项')}</span>
                    </h2>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs opacity-80 leading-normal text-justify">
                      {profile.achievements.map((ach, idx) => (
                        <li key={idx}>
                          {formatBullet(ach)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'creative':
        // Creative Bento Box / Highlight Grid Layout (Avant-garde structured widgets, asymmetric grids, beautiful highlights)
        return (
          <div className="flex flex-col h-auto min-h-full space-y-5">
            {/* Split Creative Header with colored banner design / avatar block placeholder */}
            <div className={`p-4 rounded-lg border ${currentTheme.border} ${isDark ? 'bg-slate-900/40' : 'bg-slate-50'} flex flex-row justify-between items-center gap-4 relative overflow-hidden`}>
              {/* Background Accent Subtle Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>
              
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${currentTheme.accentBg} ${currentTheme.accent} inline-block mb-2`}>
                  ⚡ SENIOR PRODUCT BUILDER
                </span>
                <h1 className={`text-3xl font-extrabold tracking-tight ${textHeadingClass} ${currentTheme.fontSerif}`}>
                  {profile.name}
                </h1>
                <p className={`text-xs font-semibold tracking-wide mt-1 opacity-80 ${currentTheme.accent}`}>
                  {profile.title}
                </p>
              </div>

              {/* Bento styled contact card block */}
              <div className={`p-3 border rounded-lg shadow-sm text-xs space-y-1.5 shrink-0 max-w-[220px] ${bentoContactsBgClass}`}>
                <div className="flex items-center gap-2">
                  <span className={currentTheme.accent}>{contactIcons.location}</span>
                  <span>{profile.contact.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={currentTheme.accent}>{contactIcons.email}</span>
                  <span className="break-all">{profile.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={currentTheme.accent}>{contactIcons.phone}</span>
                  <span>{profile.contact.phone}</span>
                </div>
                {profile.contact.github && (
                  <div className="flex items-center gap-2">
                    <span className={currentTheme.accent}>{contactIcons.github}</span>
                    <span className="truncate">{profile.contact.github}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Spotlight Professional Pitch Bento Box */}
            {!hiddenSections.includes('summary') && profile.summary && (
              <div className={`p-4 rounded-lg border-l-4 ${currentTheme.accentBorder} ${currentTheme.accentBg} text-xs leading-relaxed text-justify relative group/section`}>
                {getHideButton('summary')}
                <div className={`font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${currentTheme.accent}`}>
                  <span>💡 核心优势亮点</span>
                </div>
                <p className="opacity-95 italic">
                  {profile.summary}
                </p>
              </div>
            )}

            {/* Main Creative Bento Columns */}
            <div className="grid grid-cols-3 gap-5 mt-1 flex-grow">
              
              {/* Narrow Column: Dynamic Badges, Education, Recognitions */}
              <div className="space-y-4 col-span-1">
                {/* Bento Block 1: Skillsets Tag Cloud with progress vibes */}
                {!hiddenSections.includes('skills') && profile.skills && profile.skills.length > 0 && (
                  <div className={`p-4 rounded-lg border ${currentTheme.border} ${cardBgClass} space-y-3 relative group/section`}>
                    {getHideButton('skills')}
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b ${currentTheme.border} ${currentTheme.accent}`}>
                      <span>🔥 {getSectionTitle('skills', '核心技能')}</span>
                    </h3>
                    <div className="space-y-3.5">
                      {profile.skills.map((grp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="text-[10px] font-bold opacity-80 uppercase tracking-wide">{grp.category}</div>
                          <div className="space-y-1">
                            {grp.items.map((item, iIdx) => (
                              <span key={iIdx} className={`px-2 py-0.5 text-[9.5px] rounded-md font-mono transition duration-300 ${currentTheme.labelBg} hover:opacity-80 block w-fit`}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bento Block 2: Scholastic Background */}
                {!hiddenSections.includes('education') && profile.education && profile.education.length > 0 && (
                  <div className={`p-4 rounded-lg border ${currentTheme.border} ${cardBgClass} space-y-2.5 relative group/section`}>
                    {getHideButton('education')}
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b ${currentTheme.border} ${currentTheme.accent}`}>
                      <span>🎓 {getSectionTitle('education', '教育背景')}</span>
                    </h3>
                    <div className="space-y-3">
                      {profile.education.map((edu) => (
                        <div key={edu.id} className="text-xs">
                          <div className={`font-bold ${textHeadingClass} leading-tight`}>{edu.school}</div>
                          <div className="opacity-80 mt-0.5 leading-tight">{edu.degree} · {edu.major}</div>
                          <div className="text-[10px] font-mono opacity-60 mt-1">{edu.period}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wide Column: Experiences & Project Ventures */}
              <div className="space-y-4 col-span-2">
                {/* Bento Block 3: Chronicle Chronology */}
                {!hiddenSections.includes('experience') && profile.experience && profile.experience.length > 0 && (
                  <div className={`p-4 rounded-lg border ${currentTheme.border} ${cardBgClass} space-y-3.5 relative group/section`}>
                    {getHideButton('experience')}
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b ${currentTheme.border} ${currentTheme.accent}`}>
                      <span>💼 {getSectionTitle('experience', '工作经历')}</span>
                    </h3>
                    <div className="space-y-4">
                      {profile.experience.map((exp) => (
                        <div key={exp.id} className="relative pl-3.5 border-l-2 border-neutral-300 text-xs">
                          {/* Left dot marker */}
                          <div className={`absolute top-1 -left-1.5 w-2.5 h-2.5 rounded-full border border-white ${currentTheme.accent.replace('text-', 'bg-')}`}></div>
                          
                          <div className="flex justify-between items-baseline gap-2 mb-1">
                            <div className={`font-bold ${textHeadingClass} text-sm`}>{exp.company}</div>
                            <div className="text-[10px] font-mono opacity-60 shrink-0">{exp.period}</div>
                          </div>
                          <div className={`font-semibold mb-1.5 text-[11px] ${currentTheme.accent}`}>{exp.role}</div>
                          
                          <ul className="space-y-1 opacity-85 leading-relaxed text-justify list-disc list-outside ml-4">
                            {exp.bullets.map((bullet, idx) => (
                              <li key={idx} className="marker:text-neutral-400">
                                {formatBullet(bullet)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bento Block 4: Project Achievements Showcase */}
                {!hiddenSections.includes('projects') && profile.projects && profile.projects.length > 0 && (
                  <div className={`p-4 rounded-lg border ${currentTheme.border} ${cardBgClass} space-y-3 relative group/section`}>
                    {getHideButton('projects')}
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b ${currentTheme.border} ${currentTheme.accent}`}>
                      <span>🚀 {getSectionTitle('projects', '项目工作')}</span>
                    </h3>
                    <div className="space-y-4.5">
                      {profile.projects.map((proj) => (
                        <div key={proj.id} className="text-xs">
                          <div className="flex justify-between items-baseline gap-2 mb-1">
                            <div className={`font-bold ${textHeadingClass}`}>{proj.name}</div>
                            <span className="text-[10px] font-mono opacity-60">{proj.period}</span>
                          </div>
                          <div className="text-[10px] font-medium opacity-75 mb-1.5">【担任职责】{proj.role}</div>
                          <ul className="space-y-1 opacity-80 leading-relaxed text-justify list-disc list-outside ml-4 pb-1">
                            {proj.bullets.map((bullet, idx) => (
                              <li key={idx} className="marker:text-neutral-400">
                                {formatBullet(bullet)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Bento Block 5: Achievements Spotlights */}
                {!hiddenSections.includes('achievements') && profile.achievements && profile.achievements.length > 0 && (
                  <div className={`p-4 rounded-lg border ${currentTheme.border} ${cardBgClass} space-y-2 relative group/section`}>
                    {getHideButton('achievements')}
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-1 ${currentTheme.accent}`}>
                      <span>🏆 {getSectionTitle('achievements', '荣誉奖项')}</span>
                    </h3>
                    <ul className="space-y-1 text-xs opacity-85 leading-normal text-justify list-disc list-outside ml-4">
                      {profile.achievements.map((ach, idx) => (
                        <li key={idx} className="marker:text-neutral-400 text-[11px]">
                          {formatBullet(ach)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'classic':
      default:
        // Classic Standard Dual-Column template
        return (
          <div className="flex flex-col h-auto min-h-full">
            {getHeaderSection()}
            <div className="grid grid-cols-3 gap-6 mt-3 flex-grow">
              {/* Main Narrative Column */}
              <div className="col-span-2 space-y-6">
                {getExperienceBlock()}
                {getProjectsBlock()}
              </div>
              {/* Narrow Right Sidebar Column inside classic visual resume */}
              <div className="col-span-1 space-y-6">
                {getSkillsBlock()}
                {getEducationBlock()}
                {getAchievementsBlock()}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      id="printable-resume-page"
      className={`relative w-full max-w-[210mm] min-h-[297mm] h-auto mx-auto p-8 sm:p-10 md:p-12 shadow-2xl transition-all duration-300 rounded-sm print-page ${currentTheme.bg}`}
    >
      {renderLayoutContent()}
    </div>
  );
}
