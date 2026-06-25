import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../types';
import { Send, Sparkles, User, Bot, Sparkle, RefreshCw, Layers } from 'lucide-react';

interface RecruiterChatProps {
  currentProfile: Profile;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function RecruiterChat({ currentProfile }: RecruiterChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `你好！我是当前候选人 **${currentProfile.name}** 的智能招聘推介代表。

我熟悉此简历中蕴含的 **8+ 年微服务高并发重构、性能极速优化与全栈混合开发** 的全部细节事实。

您可以向我提问 candidate 的细节，也可以点击下方的**一键 AI 工装包组件**让我快速为您生成定制化报告：`
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick Action triggers targeting specific recruitment scenario automation
  const quickActions = [
    { label: "🔍 综合实力评估", prompt: "请针对该候选人的简历主轴，做一次全方位的硬实力与软实力综合分析，指出其最硬核的3个闪光点和潜在短板。" },
    { label: "🤝 撰写面试邀请函", prompt: "请根据此简历，以著名科技企业HR的口吻，为该候选人量身定制一封能打动他的、极具吸引力的中文面试邀请函邮件。" },
    { label: "🎓 技术压力测试提问", prompt: "请针对他的工作成果（例如5W+高吞吐秒杀、白屏率缩减、或者是Canvas层级重绘调优），设计3道具有深度架构考察视角的压力技术面试题，并提供你期望的考察要点建议。" },
    { label: "🎯 生成一锤定音推荐词", prompt: "请写一份极具分量的专属候选人推荐语与背书报告，突出高并发秒杀与全栈敏捷研发效能，说服高管立即通过他的面试安排。" }
  ];

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMsg;
    if (!textToSend.trim() || isSending) return;

    if (!customPrompt) setInputMsg('');

    const newMsgs = [...messages, { role: 'user', content: textToSend } as Message];
    setMessages(newMsgs);
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          currentResume: currentProfile
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `AI 助手连接出了点问题: ${data.error || '服务器异常'}` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `网络超时，无法与 Gemini 取得联系: ${e.message}` }]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `已重置对话！您可以任意向我提问关于 **${currentProfile.name}** 的工作成果与技术匹配度。我将随时为您解答。`
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-300 w-full no-print">
      {/* Recruiter Chat Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-slate-100">AI 招聘官互动测试沙盒</h3>
            <p className="text-[10px] text-slate-500">Recruiter Evaluation & Interview Roleplay</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-1 px-1.5 text-[10px] bg-slate-800 rounded hover:bg-slate-700 text-slate-400 flex items-center gap-1 transition"
          title="清空对话记录"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          <span>清空</span>
        </button>
      </div>

      {/* Message History Scroller */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 text-xs select-text">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar on Left */}
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700 shrink-0 select-none">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-lg p-3 leading-relaxed whitespace-pre-line text-justify ${
              msg.role === 'user'
                ? 'bg-amber-400 text-slate-950 font-medium'
                : 'bg-slate-950 text-slate-200 border border-slate-800'
            }`}>
              {msg.content}
            </div>

            {/* Avatar on Right */}
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-amber-400/25 flex items-center justify-center text-amber-300 border border-amber-400/30 shrink-0 select-none">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 rounded-lg p-3 text-[11px] text-slate-400 border border-slate-800 italic">
              智能招聘推介代表正在检索简历段落事实，整合表达模型中...
            </div>
          </div>
        )}
      </div>

      {/* Embedded Action tags */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/20 select-none">
        <div className="text-[10px] text-amber-400 mb-1.5 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>HR / 招聘官一键快捷工具 (Quick Tools)</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickActions.map((act, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(act.prompt)}
              disabled={isSending}
              className="text-[10px] bg-slate-950/90 hover:bg-slate-800 text-slate-300 active:bg-slate-800 border border-slate-800 py-1 px-2 rounded-md transition duration-150 shrink-0 truncate max-w-full disabled:opacity-50"
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={isSending}
            placeholder={`提问该候选人或定制推荐语...`}
            className="flex-grow bg-slate-900 border border-slate-800 text-xs p-2.5 rounded-lg text-slate-200 outline-none focus:border-amber-400 transition min-w-0"
          />
          <button
            type="submit"
            disabled={isSending || !inputMsg.trim()}
            className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-slate-950 transition shrink-0 shadow-lg shadow-amber-950/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
