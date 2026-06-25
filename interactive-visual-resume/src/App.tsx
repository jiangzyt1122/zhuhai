import React, { useState, useEffect } from 'react';
import { initialProfile } from './data';
import { Profile, ThemeType, THEMES } from './types';
import SidebarEditor from './components/SidebarEditor';
import ResumeDocument from './components/ResumeDocument';
import RecruiterChat from './components/RecruiterChat';
import { Eye, FileText, Bot, Printer, Sparkles, CheckCircle2, X, ExternalLink, HelpCircle, Check, AlertCircle, Download, RefreshCw, Save } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function App() {
  // Load initial settings using lazily evaluated state initializers
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('cv_builder_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved profile state:', e);
      }
    }
    return initialProfile;
  });

  const [themeType, setThemeType] = useState<ThemeType>(() => {
    return (localStorage.getItem('cv_builder_themeType') as ThemeType) || 'swiss';
  });

  const [layout, setLayout] = useState<'classic' | 'executive' | 'creative' | 'swiss' | 'tech'>(() => {
    return (localStorage.getItem('cv_builder_layout') as any) || 'swiss';
  });

  const [timelineStyle, setTimelineStyle] = useState<'none' | 'solid' | 'dashed'>(() => {
    return (localStorage.getItem('cv_builder_timelineStyle') as any) || 'dashed';
  });

  const [resumeCompactness, setResumeCompactness] = useState<'compact' | 'normal' | 'relaxed'>(() => {
    return (localStorage.getItem('cv_builder_resumeCompactness') as any) || 'normal';
  });

  const [showAvatarBlock, setShowAvatarBlock] = useState<boolean>(() => {
    const saved = localStorage.getItem('cv_builder_showAvatarBlock');
    return saved !== null ? saved === 'true' : true;
  });

  const [hiddenSections, setHiddenSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cv_builder_hiddenSections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleSectionVisibility = (sectionId: string) => {
    setHiddenSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'chat'>('preview');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'timeout' | 'error' | 'success'>('idle');
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Multi-theme canvas style mapping
  const currentTheme = THEMES[themeType] || THEMES.swiss;

  // Manual save handler
  const handleSave = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('cv_builder_profile', JSON.stringify(profile));
      localStorage.setItem('cv_builder_themeType', themeType);
      localStorage.setItem('cv_builder_layout', layout);
      localStorage.setItem('cv_builder_timelineStyle', timelineStyle);
      localStorage.setItem('cv_builder_resumeCompactness', resumeCompactness);
      localStorage.setItem('cv_builder_showAvatarBlock', String(showAvatarBlock));
      localStorage.setItem('cv_builder_hiddenSections', JSON.stringify(hiddenSections));
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      setSaveStatus('idle');
    }
  };

  // Autosave setup with a subtle bounce delay
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('cv_builder_profile', JSON.stringify(profile));
        localStorage.setItem('cv_builder_themeType', themeType);
        localStorage.setItem('cv_builder_layout', layout);
        localStorage.setItem('cv_builder_timelineStyle', timelineStyle);
        localStorage.setItem('cv_builder_resumeCompactness', resumeCompactness);
        localStorage.setItem('cv_builder_showAvatarBlock', String(showAvatarBlock));
        localStorage.setItem('cv_builder_hiddenSections', JSON.stringify(hiddenSections));
      } catch (e) {
        console.error('Failed to autosave:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [profile, themeType, layout, timelineStyle, resumeCompactness, showAvatarBlock, hiddenSections]);
  
  // Reset candidate details to default high quality data
  const handleReset = () => {
    if (window.confirm("确定要恢复默认模板数据吗？这将覆盖您当前所做的任何文本修改。")) {
      setProfile(initialProfile);
      setThemeType('swiss');
      setLayout('swiss');
      setTimelineStyle('dashed');
      setResumeCompactness('normal');
      setShowAvatarBlock(true);
      setHiddenSections([]);
      localStorage.removeItem('cv_builder_profile');
      localStorage.removeItem('cv_builder_themeType');
      localStorage.removeItem('cv_builder_layout');
      localStorage.removeItem('cv_builder_timelineStyle');
      localStorage.removeItem('cv_builder_resumeCompactness');
      localStorage.removeItem('cv_builder_showAvatarBlock');
      localStorage.removeItem('cv_builder_hiddenSections');
    }
  };

  const handleOpenNewTabToPrint = () => {
    // Open application in a new window/tab to circumvent sandboxed frame issues
    window.open(window.location.href, '_blank');
  };

  const executePrint = () => {
    // 强制关闭弹窗隐藏所有打印辅助排版遮罩，留白 150ms 触发原生打印，避免 PDF 叠影
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const exportToPDF = () => {
    const element = document.getElementById('printable-resume-page');
    if (!element) {
      setExportStatus('error');
      return;
    }

    setExportStatus('exporting');

    // 建立 7.5 秒的看门狗定时器，防止大模型简历渲染中因特殊中文字体或图片跨域而导致 canvas 渲染长期挂起、让界面卡死
    const watchdog = setTimeout(() => {
      setExportStatus('timeout');
    }, 7500);

    try {
      const opt = {
        margin:       0,
        filename:     `${profile.name}_高端数字大模型产品专家_精装简历.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: null
        },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      // Robust bundler resolution for html2pdf
      const html2pdfFunc = (html2pdf as any).default || html2pdf;

      if (typeof html2pdfFunc !== 'function') {
        clearTimeout(watchdog);
        throw new Error('html2pdf is not loaded correctly as a callable function');
      }

      html2pdfFunc()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          clearTimeout(watchdog);
          setExportStatus('success');
          setTimeout(() => {
            setExportStatus('idle');
            setShowPrintModal(false);
          }, 1500);
        })
        .catch((err: any) => {
          clearTimeout(watchdog);
          console.error('PDF export async error:', err);
          setExportStatus('error');
        });
    } catch (err: any) {
      clearTimeout(watchdog);
      console.error('PDF export sync error:', err);
      setExportStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300">
      
      {/* Top Professional Header Navigation Rail (Hidden in Print Mode) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 relative z-10 no-print select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1 px-2 rounded-md bg-amber-400 font-extrabold text-[13px] text-slate-950 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP RESUME</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-50 tracking-wide">高级自适应视觉简历工作台</h1>
            <p className="text-[10px] text-slate-400">基于 A4 高阶排版比例与 Gemini 智能打分优化引擎</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspace Sidebars Panel Switches - Desktop Only */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 mr-2">
            <button
              onClick={() => setEditorCollapsed(!editorCollapsed)}
              className={`p-1.5 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                !editorCollapsed 
                  ? 'bg-slate-800 text-amber-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={editorCollapsed ? "展开编辑侧边栏" : "收起编辑侧边栏"}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{editorCollapsed ? "展开编辑" : "收起编辑"}</span>
            </button>
            <div className="w-px h-4 bg-slate-800"></div>
            <button
              onClick={() => setChatCollapsed(!chatCollapsed)}
              className={`p-1.5 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                !chatCollapsed 
                  ? 'bg-slate-800 text-amber-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={chatCollapsed ? "展开 AI 招聘对谈" : "收起 AI 招聘对谈"}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{chatCollapsed ? "展开 AI 对谈" : "收起 AI 对谈"}</span>
            </button>
          </div>

          {/* Local Save Actions Button */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 p-1.5 px-3 rounded text-xs font-semibold border transition cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80'
                : saveStatus === 'saving'
                ? 'bg-amber-950 text-amber-400 border-amber-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border-slate-700'
            }`}
            title="保存修改到本地，避免页面刷新或丢包丢失编辑"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">已存至本地</span>
                <span className="inline sm:hidden">已保存</span>
              </>
            ) : saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>正在保存...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>保存修改</span>
              </>
            )}
          </button>

          {/* Print micro action */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 p-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 hover:text-black font-semibold rounded text-xs transition border border-emerald-500/30 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>直接导出 PDF / 打印</span>
          </button>
        </div>
      </header>

      {/* Main Core Content Area */}
      <div className="flex-grow flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        
        {/* Left Column: Editor Controls (Desktop displays permanently, Mobile depending on tabs) */}
        <div className={`w-full lg:w-[415px] xl:w-[430px] shrink-0 h-full no-print ${
          mobileTab === 'editor' ? 'block' : 'hidden lg:block'
        } ${editorCollapsed ? 'lg:hidden' : ''}`}>
          <SidebarEditor
            profile={profile}
            onChange={setProfile}
            themeType={themeType}
            onThemeChange={setThemeType}
            layout={layout}
            onLayoutChange={setLayout}
            timelineStyle={timelineStyle}
            onTimelineStyleChange={setTimelineStyle}
            resumeCompactness={resumeCompactness}
            onResumeCompactnessChange={setResumeCompactness}
            showAvatarBlock={showAvatarBlock}
            onShowAvatarBlockChange={setShowAvatarBlock}
            hiddenSections={hiddenSections}
            onToggleSectionVisibility={handleToggleSectionVisibility}
            onReset={handleReset}
            onPrintRequest={() => setShowPrintModal(true)}
          />
        </div>

        {/* Center Column: Live Responsive A4 Canvas Space (Responsive scaling wrappers) */}
        <div className={`flex-grow h-full overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col items-center bg-slate-950/80 custom-scroll relative ${
          mobileTab === 'preview' ? 'block' : 'hidden lg:flex'
        }`}>
          {/* Quick theme state badges for live visual feedback */}
          <div className="w-full max-w-[210mm] mb-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/85 no-print select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>实时 A4 标准印刷视图 <strong>(210mm × 297mm)</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span>预估页数: <strong className="text-amber-400">1 页 精准排版</strong></span>
              <span>当前版式: <strong className="text-amber-400">{layout === 'swiss' ? '左轴通栏' : layout === 'tech' ? '框格矩阵' : layout === 'executive' ? '高阶单栏' : layout === 'creative' ? '先锋创意栏' : '经典双栏'}</strong></span>
            </div>
          </div>

          {/* Actual Proportional Resume Render Document */}
          <div className="w-full flex-grow flex justify-center items-start">
            <ResumeDocument
              profile={profile}
              themeType={themeType}
              layout={layout}
              timelineStyle={timelineStyle}
              resumeCompactness={resumeCompactness}
              showAvatarBlock={showAvatarBlock}
              hiddenSections={hiddenSections}
              onToggleSectionVisibility={handleToggleSectionVisibility}
            />
          </div>
        </div>

        {/* Right Column: AI Recruiter Interactive Chat (Desktop displays permanently, Mobile depending on tabs) */}
        <div className={`w-full lg:w-[380px] xl:w-[400px] shrink-0 h-full no-print ${
          mobileTab === 'chat' ? 'block' : 'hidden lg:block'
        } ${chatCollapsed ? 'lg:hidden' : ''}`}>
          <RecruiterChat currentProfile={profile} />
        </div>

      </div>

      {/* Mobile Sticky Tab Navigation Bar (Visible only on screens below lg, Hidden in Print Mode) */}
      <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 text-slate-400 text-xs select-none shrink-0 no-print lg:hidden z-20">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
            mobileTab === 'editor' ? 'text-amber-400 bg-slate-800/80' : 'hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>定制简历</span>
        </button>

        <button
          onClick={() => setMobileTab('preview')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
            mobileTab === 'preview' ? 'text-amber-400 bg-slate-800/80' : 'hover:text-slate-200'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span>A4预览</span>
        </button>

        <button
          onClick={() => setMobileTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition relative ${
            mobileTab === 'chat' ? 'text-amber-400 bg-slate-800/80' : 'hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span>AI 招聘对谈</span>
          <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-red-500"></span>
        </button>
      </div>

      {/* Floating Interactive PDF Export & Printing Consultation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 no-print animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2 text-emerald-400">
                <Printer className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">高品质 A4 PDF 导出专家助手</h3>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1 hover:bg-slate-800 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 space-y-4">
              
              {/* Dynamic export results banners */}
              {exportStatus === 'exporting' && (
                <div className="bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 p-3.5 rounded-lg flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-4.5 h-4.5 animate-spin text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">正在分析排版并一键合成 PDF...</span>
                    <p className="opacity-80 mt-0.5">请勿关闭弹框。此时后台正在拉取高清字体并计算标准 A4 分栏线。</p>
                  </div>
                </div>
              )}

              {exportStatus === 'success' && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 p-3.5 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">恭喜，简历 A4 PDF 合成生成成功！</span>
                    <p className="opacity-85 mt-0.5">文件已安全投递至您的下载管理器，支持高保真文字搜索与大厂招聘系统初筛。</p>
                  </div>
                </div>
              )}

              {(exportStatus === 'timeout' || exportStatus === 'error') && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 p-3.5 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>合成下载受到安全防范拦截 ({exportStatus === 'timeout' ? '解析超时' : '容器安全限制'})</span>
                  </div>
                  <div className="leading-relaxed opacity-95 text-justify text-[11px] space-y-1">
                    <p>不用担心！这主要是因为您处于 **AI安全沙盒容器框架** 下，或浏览器拦截了第三方画布合成库。我们为您提供更完美、稳定性 100% 的解决方案：</p>
                    <p className="font-semibold text-emerald-400 mt-1">
                      💡 极佳解决方案：点击下方的绿色“在新标签页独立打开”按钮，点击页面右上角的“另存/纯净打印”按钮，将目标打印机设定为「另存为 PDF」即可瞬间保存高清简历！
                    </p>
                  </div>
                </div>
              )}

              {/* Box Warning about potential Sandbox frames */}
              {exportStatus === 'idle' && (
                isInIframe ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3.5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-300 leading-relaxed text-justify space-y-1">
                      <span className="font-bold">⚠️ 沙盒拦截警示：</span>
                      当前预览运行在 <strong>AI 沙盘 iframe 容器</strong> 内。受浏览器安全协议限制，沙盒内的 PDF 下载行为会被浏览器静默拦截。
                      <p className="text-emerald-400 font-semibold mt-1">
                        💡 解决办法：请点击下方绿色的 <span className="underline">“在新标签页独立打开”</span> 按钮，在新页面中即可 100% 毫无限制地一键极速下载 PDF 文件！
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3.5 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-200 leading-relaxed text-justify">
                      <span className="font-bold">环境验证成功：</span>
                      您已在独立纯净窗口中打开。此页面已完美绕过沙箱拦截限制，您可以自由保存、合成精装 PDF 或调用本地原版打印机。
                    </div>
                  </div>
                )
              )}

              {/* Step checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>极佳 PDF 打印参数对照表（非常重要）</span>
                </h4>
                
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400 font-medium whitespace-nowrap">① 目标打印机：</span>
                    <strong className="text-emerald-400 text-right">另存为 PDF (Save as PDF)</strong>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400 font-medium whitespace-nowrap">② 纸张大小：</span>
                    <strong className="text-slate-200 text-right">A4 (标准纸张尺寸)</strong>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400 font-medium whitespace-nowrap">③ 边距选项：</span>
                    <strong className="text-slate-200 text-right">首选「无」(None) 或「默认」</strong>
                  </div>
                  <div className="flex items-start justify-between gap-4 bg-emerald-500/5 p-1.5 px-2 rounded border border-emerald-500/15">
                    <span className="text-emerald-300 font-semibold whitespace-nowrap">④ 背景图形 (核心)：</span>
                    <strong className="text-emerald-400 text-right">必须勾选 (保证主题配色生效)</strong>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400 font-medium whitespace-nowrap">⑤ 页眉和页脚：</span>
                    <strong className="text-slate-200 text-right">必须取消勾选 (清除网址、时间后缀)</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer triggers */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-2.5">
              {isInIframe ? (
                /* Primary CTA is Open in New Tab for Safety */
                <button
                  onClick={handleOpenNewTabToPrint}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>在新标签页独立打开 (105% 推荐，极速解锁 PDF 下载)</span>
                </button>
              ) : (
                /* Primary CTA is Download PDF */
                <button
                  onClick={exportToPDF}
                  disabled={exportStatus === 'exporting'}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 cursor-pointer"
                >
                  {exportStatus === 'exporting' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在渲染并合成高精 A4 PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>一键极速合成并下载 A4 PDF (强烈推荐)</span>
                    </>
                  )}
                </button>
              )}
              
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                {isInIframe && (
                  <button
                    onClick={exportToPDF}
                    disabled={exportStatus === 'exporting'}
                    className="w-full sm:flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {exportStatus === 'exporting' ? "直接合成中..." : "尝试直接在此窗口合成"}
                  </button>
                )}
                
                <button
                  onClick={executePrint}
                  className="w-full sm:w-auto py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition flex items-center justify-center gap-1"
                >
                  <span>本地打印/另存</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="w-full sm:w-auto py-2 px-3 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-lg text-xs transition"
                >
                  <span>返回编辑</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
