import React, { useState } from 'react';
import { Profile, ThemeType, THEMES } from '../types';
import { Edit3, Sparkles, Plus, Trash2, Code, RotateCcw, Check, Sparkle, Download, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface SidebarEditorProps {
  profile: Profile;
  onChange: (updated: Profile) => void;
  themeType: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  layout: 'classic' | 'executive' | 'creative' | 'swiss' | 'tech';
  onLayoutChange: (layout: 'classic' | 'executive' | 'creative' | 'swiss' | 'tech') => void;
  timelineStyle: 'none' | 'solid' | 'dashed';
  onTimelineStyleChange: (val: 'none' | 'solid' | 'dashed') => void;
  resumeCompactness: 'compact' | 'normal' | 'relaxed';
  onResumeCompactnessChange: (val: 'compact' | 'normal' | 'relaxed') => void;
  showAvatarBlock: boolean;
  onShowAvatarBlockChange: (val: boolean) => void;
  hiddenSections: string[];
  onToggleSectionVisibility: (val: string) => void;
  onReset: () => void;
  onPrintRequest: () => void;
}

export default function SidebarEditor({
  profile,
  onChange,
  themeType,
  onThemeChange,
  layout,
  onLayoutChange,
  timelineStyle,
  onTimelineStyleChange,
  resumeCompactness,
  onResumeCompactnessChange,
  showAvatarBlock,
  onShowAvatarBlockChange,
  hiddenSections,
  onToggleSectionVisibility,
  onReset,
  onPrintRequest
}: SidebarEditorProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'personal' | 'experience' | 'projects' | 'skills' | 'raw'>('style');
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [optimizeTargetValue, setOptimizeTargetValue] = useState<string>('');
  const [optimizeResult, setOptimizeResult] = useState<string>('');
  const [optimizeTargetField, setOptimizeTargetField] = useState<{ type: string; id: string; idx: number } | null>(null);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(profile, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  // Trigger server-side AI optimization
  const handleAIOptimize = async (text: string, type: string, id: string, idx: number) => {
    if (!text.trim()) return;
    setOptimizingId(`${type}-${id}-${idx}`);
    setOptimizeResult('AI 专家正在分析结构并重构语句，请稍候...');
    setOptimizeTargetField({ type, id, idx });

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ section: type, content: text })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setOptimizeResult(data.text);
      } else {
        setOptimizeResult(`AI 优化服务响应失败: ${data.error || '原因未知'}`);
      }
    } catch (e: any) {
      setOptimizeResult(`通信中断: ${e.message}`);
    }
  };

  const handleApplyOptimization = (selectedText: string, targetField: typeof optimizeTargetField) => {
    if (!targetField) return;
    const { type, id, idx } = targetField;

    const copy = { ...profile };

    if (type === 'summary') {
      copy.summary = selectedText;
    } else if (type === 'experience') {
      copy.experience = copy.experience.map(exp => {
        if (exp.id === id) {
          const b = [...exp.bullets];
          b[idx] = selectedText;
          return { ...exp, bullets: b };
        }
        return exp;
      });
    } else if (type === 'projects') {
      copy.projects = copy.projects.map(proj => {
        if (proj.id === id) {
          const b = [...proj.bullets];
          b[idx] = selectedText;
          return { ...proj, bullets: b };
        }
        return proj;
      });
    } else if (type === 'achievements') {
      if (copy.achievements) {
        const b = [...copy.achievements];
        b[idx] = selectedText;
        copy.achievements = b;
      }
    }

    onChange(copy);
    setOptimizingId(null);
    setOptimizeTargetField(null);
    setOptimizeResult('');
  };

  // Field generic change emitters
  const updatePersonalInfo = (field: string, val: string) => {
    const copy = { ...profile };
    if (field === 'name') copy.name = val;
    else if (field === 'title') copy.title = val;
    else if (field === 'summary') copy.summary = val;
    else {
      copy.contact = {
        ...copy.contact,
        [field]: val
      };
    }
    onChange(copy);
  };

  const updateExperience = (id: string, field: string, val: any, idx?: number) => {
    const updatedExp = profile.experience.map(exp => {
      if (exp.id === id) {
        if (field === 'bullets' && typeof idx === 'number') {
          const newBullets = [...exp.bullets];
          newBullets[idx] = val;
          return { ...exp, bullets: newBullets };
        }
        if (field === 'skillsUsed') {
          return { ...exp, skillsUsed: val.split(',').map((s: string) => s.trim()) };
        }
        return { ...exp, [field]: val };
      }
      return exp;
    });
    onChange({ ...profile, experience: updatedExp });
  };

  const addExperience = () => {
    const newId = `exp-${Date.now()}`;
    const newExp = {
      id: newId,
      company: "新增企业名称",
      role: "研发岗位",
      period: "2024.01 - 至今",
      location: "北京",
      bullets: ["使用 Z 技术，顺利完成 X 任务，从而提升了 Y% 系统可用度。"]
    };
    onChange({ ...profile, experience: [...profile.experience, newExp] });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...profile,
      experience: profile.experience.filter(e => e.id !== id)
    });
  };

  const addExperienceBullet = (expId: string) => {
    const updatedExp = profile.experience.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          bullets: [...exp.bullets, "在此填写一条具体的高含金量成果或成效细节。"]
        };
      }
      return exp;
    });
    onChange({ ...profile, experience: updatedExp });
  };

  const removeExperienceBullet = (expId: string, bIdx: number) => {
    const updatedExp = profile.experience.map(exp => {
      if (exp.id === expId) {
        const newBullets = exp.bullets.filter((_, idx) => idx !== bIdx);
        return { ...exp, bullets: newBullets };
      }
      return exp;
    });
    onChange({ ...profile, experience: updatedExp });
  };

  const addProjectBullet = (projId: string) => {
    const updatedProj = profile.projects.map(proj => {
      if (proj.id === projId) {
        return {
          ...proj,
          bullets: [...proj.bullets, "在此填写该项目的一条核心产出、功能实现或优化成效。"]
        };
      }
      return proj;
    });
    onChange({ ...profile, projects: updatedProj });
  };

  const removeProjectBullet = (projId: string, bIdx: number) => {
    const updatedProj = profile.projects.map(proj => {
      if (proj.id === projId) {
        const newBullets = proj.bullets.filter((_, idx) => idx !== bIdx);
        return { ...proj, bullets: newBullets };
      }
      return proj;
    });
    onChange({ ...profile, projects: updatedProj });
  };

  const addProject = () => {
    const newId = `proj-${Date.now()}`;
    const newProj = {
      id: newId,
      name: "新增核心项目名称",
      role: "系统设计 / 核心研发人员",
      period: "2024.01 - 2024.06",
      bullets: ["在此描述该项目采用的架构、遇到的难点、核心解决方案以及带来的技术与商业指标提升。"]
    };
    onChange({ ...profile, projects: [...profile.projects, newProj] });
  };

  const removeProject = (id: string) => {
    onChange({
      ...profile,
      projects: profile.projects.filter(p => p.id !== id)
    });
  };

  const handleJsonSubmit = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.name && parsed.contact) {
        onChange(parsed);
        setParseError(null);
      } else {
        setParseError("简历格式有误，必须至少包含 'name' 与 'contact' 节点。");
      }
    } catch (e: any) {
      setParseError(`JSON 语法解析错误: ${e.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-full no-print">
      {/* Sidebar Control Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-slate-950 p-1.5 rounded font-bold text-xs flex items-center justify-center">
            CV
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">视觉自适应履历编辑器</h2>
            <p className="text-[10px] text-slate-400">Perfect Layout · Real-time AI Optimize</p>
          </div>
        </div>
        <button
          onClick={onReset}
          title="重置为默认高质数据"
          className="p-1 px-2 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-400 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>恢复默认</span>
        </button>
      </div>

      {/* Editor Main Switch Tabs */}
      <div className="flex border-b border-slate-800 text-xs overflow-x-auto whitespace-nowrap bg-slate-950">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 px-3 border-b-2 font-medium transition ${
            activeTab === 'style' ? 'border-amber-400 text-amber-300 bg-slate-900' : 'border-transparent hover:bg-slate-900'
          }`}
        >
          主题版式
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-3 px-3 border-b-2 font-medium transition ${
            activeTab === 'personal' ? 'border-amber-400 text-amber-300 bg-slate-900' : 'border-transparent hover:bg-slate-900'
          }`}
        >
          基本信息
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex-1 py-3 px-3 border-b-2 font-medium transition ${
            activeTab === 'experience' ? 'border-amber-400 text-amber-300 bg-slate-900' : 'border-transparent hover:bg-slate-900'
          }`}
        >
          工作履历
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-3 px-3 border-b-2 font-medium transition ${
            activeTab === 'projects' ? 'border-amber-400 text-amber-300 bg-slate-900' : 'border-transparent hover:bg-slate-900'
          }`}
        >
          核心项目
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-3 px-3 border-b-2 font-medium transition ${
            activeTab === 'skills' ? 'border-amber-400 text-amber-300 bg-slate-900' : 'border-transparent hover:bg-slate-900'
          }`}
        >
          专业技能
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`flex-1 py-3 px-3 border-b-2 font-medium transition ${
            activeTab === 'raw' ? 'border-amber-400 text-amber-300 bg-slate-900' : 'border-transparent hover:bg-slate-900'
          }`}
        >
          JSON
        </button>
      </div>

      {/* Editor Form Action Sheets */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {activeTab === 'style' && (
          <div className="space-y-5 fade-in">
            {/* Style Theme Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                视觉风格主题 (Themes)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map(t => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id as ThemeType)}
                    className={`p-2.5 rounded border text-left transition ${
                      themeType === t.id
                        ? 'border-amber-400 bg-slate-800 text-amber-300 shadow-md'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.name}</div>
                    <div className="text-[10px] opacity-65 mt-0.5 leading-tight">
                      {t.id === 'swiss' && '极简高雅印刷感'}
                      {t.id === 'luxury' && '尊贵金沙夜间模式'}
                      {t.id === 'emerald' && '翡翠创意扁平化'}
                      {t.id === 'tech' && '极客暗黑终端感'}
                      {t.id === 'indigo' && '深邃人文优雅靛蓝'}
                      {t.id === 'amber_warm' && '护眼温暖文艺沙色'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Grid Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                排版组件布局 (Grid Layouts)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2">
                {[
                  { id: 'classic', label: '经典双栏', desc: '商业领袖常选' },
                  { id: 'executive', label: '高级单栏', desc: '大厂牛人极简' },
                  { id: 'creative', label: '创意盒子', desc: '先锋创新设计' },
                  { id: 'swiss', label: '左轴通栏', desc: '极简通栏导航' },
                  { id: 'tech', label: '框格矩阵', desc: '极客严谨Mono' }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => onLayoutChange(l.id as any)}
                    className={`p-2 rounded border text-center transition flex flex-col justify-center items-center ${
                      layout === l.id
                        ? 'border-amber-400 bg-slate-800 text-amber-300'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold whitespace-nowrap">{l.label}</div>
                    <div className="text-[9px] opacity-50 mt-1 leading-none">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Structure and Spacing customizers */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                <span>🎨 简历格式与精致微调</span>
                <span className="text-[9px] text-slate-500 font-mono">Options</span>
              </div>

              {/* Spacing compactness */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400">
                  行高与间距密实度 (Compactness)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'compact', label: '极度紧凑', desc: '页多精缩' },
                    { id: 'normal', label: '标准匀称', desc: 'A4完美配比' },
                    { id: 'relaxed', label: '宽裕舒适', desc: '留白饱满' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => onResumeCompactnessChange(c.id as any)}
                      className={`py-1 px-1.5 rounded text-[10px] border text-center transition ${
                        resumeCompactness === c.id
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Style */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400">
                  工作经历时间轴线 (Timeline Track)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'none', label: '无时间轴' },
                    { id: 'solid', label: '实线 timeline' },
                    { id: 'dashed', label: '虚线 timeline' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => onTimelineStyleChange(t.id as any)}
                      className={`py-1 px-1 rounded text-[10px] border text-center transition ${
                        timelineStyle === t.id
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div>{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Letter Monogram Avatar Badge */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
                <span>在页顶呈现首字圆形徽标 (Avatar Initial)</span>
                <button
                  onClick={() => onShowAvatarBlockChange(!showAvatarBlock)}
                  className={`px-2 py-0.5 rounded border font-semibold transition ${
                    showAvatarBlock
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                  }`}
                >
                  {showAvatarBlock ? "已启用" : "已隐藏"}
                </button>
              </div>
            </div>

            {/* Plates / Active Sections Manager */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                <span>👁️ 简历板块显示控制 (Sections)</span>
                <span className="text-[9px] text-slate-500 font-mono">Toggles</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                可自由开启或隐藏（取消展示）特定的局部板块。您也可以在右侧简历中直接点击悬浮的隐藏按钮。
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: 'summary', name: '个人优势 / 亮点' },
                  { id: 'skills', name: '技术专长 / 技能' },
                  { id: 'experience', name: '工作组织 / 经历' },
                  { id: 'projects', name: '项目复盘 / 经历' },
                  { id: 'education', name: '学术背景 / 教育' },
                  { id: 'achievements', name: '荣誉奖项 / 成就' }
                ].map(s => {
                  const isVisible = !hiddenSections.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => onToggleSectionVisibility(s.id)}
                      className={`flex items-center justify-between p-2 rounded text-[10px] border transition text-left cursor-pointer ${
                        isVisible
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200'
                          : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      {isVisible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plates / Section Names Customizer */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                <span>✏️ 板块个性化重命名 (Renaming)</span>
                <span className="text-[9px] text-slate-500 font-mono">Customize</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                您可以自由修改简历中各个主要板块的显示标题。留空则直接加载各排版风格所自带的精选初始文案。
              </p>
              <div className="space-y-2 pt-1">
                {[
                  { key: 'skills', label: '核心技能 / 技能清单', placeholder: '如：技术专长、核心技能、Skills 等' },
                  { key: 'experience', label: '工作经历 / 实践经历', placeholder: '如：工作履历、任职历程、Experience 等' },
                  { key: 'projects', label: '项目工作 / 个人项目', placeholder: '如：项目经验、复盘经历、Projects 等' },
                  { key: 'education', label: '教育背景 / 学术资质', placeholder: '如：学术背景、教育背景、Education 等' },
                  { key: 'achievements', label: '荣誉奖项 / 成果收获', placeholder: '如：荣誉成就、荣誉奖项、Awards 等' }
                ].map(item => {
                  const currentVal = profile.sectionNames?.[item.key as keyof typeof profile.sectionNames] || '';
                  return (
                    <div key={item.key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] text-slate-400 font-medium">{item.label}</span>
                        {currentVal && (
                          <button
                            onClick={() => {
                              const updatedSectionNames = {
                                ...(profile.sectionNames || {}),
                                [item.key]: ''
                              };
                              onChange({
                                ...profile,
                                sectionNames: updatedSectionNames
                              });
                            }}
                            className="text-[9px] text-slate-500 hover:text-amber-400 font-mono transition"
                            title="恢复缺省文本"
                          >
                            [还原]
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentVal}
                        placeholder={item.placeholder}
                        onChange={(e) => {
                          const updatedSectionNames = {
                            ...(profile.sectionNames || {}),
                            [item.key]: e.target.value
                          };
                          onChange({
                            ...profile,
                            sectionNames: updatedSectionNames
                          });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export and Print Options */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-300">
                <Download className="w-4 h-4" />
                <h4 className="text-xs font-bold">导出与打印</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400 text-justify">
                本程序提供完美且自适应的 A4 打印样式。
                在桌面打印菜单（Ctrl+P 或 Cmd+P），将 <strong>目标打印机</strong> 设为 <strong>“另存为 PDF”</strong>，并将 <strong>边距</strong> 设为 <strong>“无”</strong> 或 <strong>“默认”</strong>。
              </p>
              <button
                onClick={onPrintRequest}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs transition shadow-lg shadow-emerald-950/20"
              >
                唤醒 A4 完美打印 (Ctrl + P)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="space-y-4 fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">个人核心信息</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">姓名姓名</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">职位抬头</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">电子邮箱</label>
                <input
                  type="text"
                  value={profile.contact.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">联系电话</label>
                <input
                  type="text"
                  value={profile.contact.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">地理位置</label>
                <input
                  type="text"
                  value={profile.contact.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Github 主页</label>
                <input
                  type="text"
                  value={profile.contact.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] text-slate-400">个人优势总结 / 简介 (AI 赋能)</label>
                <button
                  onClick={() => handleAIOptimize(profile.summary, 'summary', 'sum', 0)}
                  className="flex items-center gap-1 text-[9px] text-amber-300 hover:text-amber-200"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI 一键润色并加强指标</span>
                </button>
              </div>
              <textarea
                value={profile.summary}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs leading-relaxed focus:border-amber-400 outline-none resize-none"
              />
            </div>

            {/* Render in-app live AI optimization view inline */}
            {optimizingId === 'summary-sum-0' && (
              <div className="p-3 bg-slate-950 border border-amber-900/40 rounded-lg space-y-2 animation-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Sparkle className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini AI 建议词条版本</span>
                  </div>
                  <button
                    onClick={() => setOptimizingId(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    取消
                  </button>
                </div>
                <div className="text-[11px] leading-relaxed max-h-40 overflow-y-auto text-slate-300 whitespace-pre-line p-2 bg-slate-900 rounded select-text">
                  {optimizeResult}
                </div>
                {optimizeResult && !optimizeResult.includes('正在') && (
                  <button
                    onClick={() => handleApplyOptimization(optimizeResult, optimizeTargetField)}
                    className="w-full py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded"
                  >
                    采纳并替换
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-4 fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">工作公司条目列表</h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-xs text-amber-300 bg-slate-800 px-2 py-1 rounded hover:bg-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增履历</span>
              </button>
            </div>

            {profile.experience.map((exp) => (
              <div key={exp.id} className="p-3 border border-slate-800 bg-slate-950 rounded-lg space-y-2 relative">
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-500 rounded transition"
                  title="删除此企业条目"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-400">企业/组织</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400">角色/主要职能</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-400">起讫时间</label>
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400">工作城市</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[9px] text-slate-400 font-bold">主要成果成效与贡献点</label>
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(exp.id)}
                      className="flex items-center gap-1 text-[9px] text-amber-400 hover:text-amber-300 font-semibold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded transition"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>新增一成效</span>
                    </button>
                  </div>
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="space-y-2 mb-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-amber-400 font-bold font-mono">成效 #{bIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(exp.id, bIdx)}
                            className="text-slate-500 hover:text-red-400 transition"
                            title="删除此成效"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAIOptimize(bullet, 'experience', exp.id, bIdx)}
                          className="flex items-center gap-0.5 text-[8.5px] text-amber-300 hover:text-amber-200"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI 打磨该条成果</span>
                        </button>
                      </div>
                      <textarea
                        value={bullet}
                        onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value, bIdx)}
                        className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-[11px] focus:border-amber-400 outline-none"
                        rows={4}
                      />

                      {/* Display inline AI rewrite status */}
                      {optimizingId === `experience-${exp.id}-${bIdx}` && (
                        <div className="p-2 bg-slate-900 border border-amber-900/40 rounded space-y-1 mt-1">
                          <div className="text-[10px] text-amber-300 font-bold block">AI 精细化加工建议:</div>
                          <div className="text-[10px] leading-relaxed max-h-32 overflow-y-auto bg-slate-950 p-1.5 rounded select-text">
                            {optimizeResult}
                          </div>
                          {optimizeResult && !optimizeResult.includes('正在') && (
                            <button
                              type="button"
                              onClick={() => handleApplyOptimization(optimizeResult, optimizeTargetField)}
                              className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-[9px] rounded hover:bg-amber-300"
                            >
                              采纳并应用此业绩表达
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4 fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">核心独立/主导项目</h3>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1 text-xs text-amber-300 bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增项目</span>
              </button>
            </div>
            {profile.projects.map((proj) => (
              <div key={proj.id} className="p-3 border border-slate-800 bg-slate-950 rounded-lg space-y-2 relative">
                <button
                  type="button"
                  onClick={() => removeProject(proj.id)}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-500 rounded transition"
                  title="删除此项目"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2 pr-6">
                  <div>
                    <label className="block text-[9px] text-slate-400">项目名称</label>
                    <input
                      type="text"
                      value={proj.name}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                      onChange={(e) => {
                        const updated = profile.projects.map(p => p.id === proj.id ? { ...p, name: e.target.value } : p);
                        onChange({ ...profile, projects: updated });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400">职责分工</label>
                    <input
                      type="text"
                      value={proj.role}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                      onChange={(e) => {
                        const updated = profile.projects.map(p => p.id === proj.id ? { ...p, role: e.target.value } : p);
                        onChange({ ...profile, projects: updated });
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-400">起讫时间</label>
                    <input
                      type="text"
                      value={proj.period || ''}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                      onChange={(e) => {
                        const updated = profile.projects.map(p => p.id === proj.id ? { ...p, period: e.target.value } : p);
                        onChange({ ...profile, projects: updated });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400">项目链接 (可选)</label>
                    <input
                      type="text"
                      value={proj.link || ''}
                      placeholder="e.g. github.com/..."
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none"
                      onChange={(e) => {
                        const updated = profile.projects.map(p => p.id === proj.id ? { ...p, link: e.target.value } : p);
                        onChange({ ...profile, projects: updated });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[9px] text-slate-400 font-bold">主要成果与成效详情</label>
                    <button
                      type="button"
                      onClick={() => addProjectBullet(proj.id)}
                      className="flex items-center gap-1 text-[9px] text-amber-400 hover:text-amber-300 font-semibold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded transition"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>新增一成效</span>
                    </button>
                  </div>
                  {proj.bullets.map((bullet, idx) => (
                    <div key={idx} className="space-y-2 mb-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-amber-400 font-bold font-mono">成效 #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeProjectBullet(proj.id, idx)}
                            className="text-slate-500 hover:text-red-400 transition"
                            title="删除此成效"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAIOptimize(bullet, 'projects', proj.id, idx)}
                          className="flex items-center gap-0.5 text-[8.5px] text-amber-300 hover:text-amber-200"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI 项目优化</span>
                        </button>
                      </div>
                      <textarea
                        value={bullet}
                        className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-[11px] focus:border-amber-400 outline-none"
                        rows={4}
                        onChange={(e) => {
                          const updated = profile.projects.map(p => {
                            if (p.id === proj.id) {
                              const b = [...p.bullets];
                              b[idx] = e.target.value;
                              return { ...p, bullets: b };
                            }
                            return p;
                          });
                          onChange({ ...profile, projects: updated });
                        }}
                      />

                      {/* Display inline AI project rewrite */}
                      {optimizingId === `projects-${proj.id}-${idx}` && (
                        <div className="p-2.5 bg-slate-900 border border-amber-900/40 rounded space-y-1 mt-1">
                          <span className="text-[10px] text-amber-300 font-bold block">AI 项目高大上润色:</span>
                          <div className="text-[10px] leading-relaxed max-h-32 overflow-y-auto bg-slate-950 p-1.5 rounded select-text">
                            {optimizeResult}
                          </div>
                          {optimizeResult && !optimizeResult.includes('正在') && (
                            <button
                              type="button"
                              onClick={() => handleApplyOptimization(optimizeResult, optimizeTargetField)}
                              className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-[9px] rounded"
                            >
                              采纳此版
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4 fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">专业技能矩阵</h3>
              <button
                type="button"
                onClick={() => {
                  const updated = [...profile.skills, { category: '新增技能方向', items: ['核心技能A', '核心技能B'] }];
                  onChange({ ...profile, skills: updated });
                }}
                className="flex items-center gap-1 text-xs text-amber-300 bg-slate-850 px-2 py-1 rounded hover:bg-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增技能分类</span>
              </button>
            </div>
            {profile.skills.map((skillGroup, grpIdx) => (
              <div key={grpIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => {
                    const updated = profile.skills.filter((_, idx) => idx !== grpIdx);
                    onChange({ ...profile, skills: updated });
                  }}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-500 rounded transition"
                  title="删除此分类"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="pr-6">
                  <label className="block text-[9px] text-slate-400 font-bold mb-1">分类名称 (Title)</label>
                  <input
                    type="text"
                    value={skillGroup.category}
                    onChange={(e) => {
                      const updated = profile.skills.map((g, idx) => idx === grpIdx ? { ...g, category: e.target.value } : g);
                      onChange({ ...profile, skills: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs text-amber-300 font-bold focus:border-amber-400 outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-400 font-bold mb-1">专业技能项</label>
                  <input
                    type="text"
                    value={skillGroup.items.join(', ')}
                    placeholder="使用英文逗号分隔技能"
                    onChange={(e) => {
                      const newItems = e.target.value.split(',').map(s => s.trim());
                      const updated = profile.skills.map((g, idx) => idx === grpIdx ? { ...g, items: newItems } : g);
                      onChange({ ...profile, skills: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs focus:border-amber-400 outline-none font-mono"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">示例：React, Vue, Webpack (用英文逗号分隔)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-3 flex flex-col h-full fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">导入/导出原始 JSON 配置文件</h3>
              <button
                onClick={() => setJsonText(JSON.stringify(profile, null, 2))}
                className="text-[11px] text-amber-300 bg-slate-800 px-2 py-0.5 rounded"
              >
                生成最新
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
              本模式供想要备份自己简历细节的高端玩家使用。你可以复制下面的 JSON 自行保存，或者如果你要把现有的简历一键填入，可以修改此处的 JSON 后点击『格式校验并装载』：
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              className="w-full bg-slate-950 text-emerald-400 font-mono text-[10px] p-2.5 rounded border border-slate-800 h-96 outline-none focus:border-amber-400"
            />
            {parseError && (
              <div className="p-2.5 bg-red-950/40 border border-red-900/60 rounded text-red-300 text-[11px] font-mono whitespace-pre-wrap">
                {parseError}
              </div>
            )}
            <button
              onClick={handleJsonSubmit}
              className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition"
            >
              格式校验并强力装载至 A4 Canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
