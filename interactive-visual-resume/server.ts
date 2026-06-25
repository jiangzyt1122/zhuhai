import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Initialization of Gemini to avoid crashing if API Key is missing.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST route for LLM chat with AI Recruiter representing candidate
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentResume } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Friendly fallback if key is missing, maintaining usability!
      console.log("No valid GEMINI_API_KEY. Standard mock advisor responding.");
      
      const lastMsg = messages[messages.length - 1]?.content || "";
      let mockReply = "";
      
      if (lastMsg.toLowerCase().includes("hello") || lastMsg.includes("你好")) {
        mockReply = "你好！我是您的简历智能顾问。目前由于尚未检测到 `GEMINI_API_KEY`，我正运行在离线模拟环境中。请您在 AI Studio 的 **Settings > Secrets** 或是Secrets面板配置上您的API Key，点击保存后我的完整AI对话与简历打分、招聘官一键匹配功能就会立即激活！我的离线回复：张子墨的简历非常完整，包含 8+ 年全栈微服务架构师经验与硕士工程背景，非常适合资深全栈、前端架构、或人工智能结合的研发岗位！";
      } else {
        mockReply = `【模拟顾问】由于未运行在真实大模型模式下（请在右上角Secrets配置 \`GEMINI_API_KEY\` 激活真实大模型体验），我在此给您提供关于该简历的专业分析：张子墨具备顶尖的架构指标，包括提升冷启动时效65%、秒杀吞吐5W+ QPS、Canvas图层渲染调优等可量化指标。您可以随时输入您的专属简历或文本，我将离线存储并由前端做实时渲染渲染展示！您刚才的问题：“${lastMsg}” 已经由前端控制面板缓存记录。`;
      }
      
      res.json({ text: mockReply });
      return;
    }

    // Prepare systemic background context based on latest candidate data
    const candidateContext = currentResume ? JSON.stringify(currentResume) : 'No candidate data submitted yet.';
    
    const systemInstruction = `你的名字叫“智能招聘代表”。你是张子墨（或者当前正在浏览的简历候选人）专属聘请的、代表其利益并熟知其简历一切细节的高级 AI 职业特助，用于跟前来的HR或技术大牛沟通。
    对方是潜在雇主、技术面试官、或者是对此简历感兴趣。

    你的工作职责、语气和行为规范：
    1. 你熟知并且只能基于以下候选人简历事实（以 JSON 形式给出）来进行交谈和回答问题。切记切记：绝对不能编造任何候选人没有写过的核心学术成就或工作经历。
    候选人简历内容：
    ${candidateContext}

    2. 你的说话风格为：儒雅、真诚、职业化、幽默且富有洞察力。你可以赞美候选人在各种场景的成果（如降本增效指标、算法优异度），但要用扎实的技术细节和数据支撑，不做低端的王婆卖卖。
    3. 如果对方问及候选人的薪资、联系方式或需要约见面试，你可以友好地告知可以通过简历上已有的邮件或电话方式进行商务预约。
    4. 允许对方以HR身份，让你“根据这个候选人的情况写一封定制化的面试邀请函”或者“针对这个候选人写一份定制化的推荐语”。支持生成定制化面试邀请报告或一锤定音推荐词。
    5. 如果用户输入的并不是张子墨，而是编辑了自己的新简历（由 candidateContext 格式提供），请你自动无缝跟上新简历的核心信息，代表新主角。

    仅给出精简、结构清晰、阅读方便的中文 Markdown 回复。不要输出无意义的项目代码或系统日志。`;

    // Map history to contents payload compatible with @google/genai
    // Note that @google/genai contents accepts { role: "user" | "model", parts: [{ text: string }] }
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Call modern generateContent across gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini communication failed:', error);
    res.status(500).json({ error: error.message || 'Error occurred communicating with GenAI backend.' });
  }
});

// REST route to leverage Gemini to optimize/polish resume sections!
app.post('/api/optimize', async (req, res) => {
  try {
    const { section, content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Mock returned optimized content for demo purposes when offline
      let mockOptimized = "【智能优化建议】在当前离线模拟环境中为您润色。配置 `GEMINI_API_KEY` 以获得专业的 AI 指标量化优化！\n\n优化后的陈述建议：\n- 运用创新式手段（X），成功重构底层核心系统主链路（Y），使得核心运行加载损耗锐减 **38%**，极致提高全网日均响应效率，保障团队业务周转率（Z）。";
      res.json({ text: mockOptimized });
      return;
    }

    const systemInstruction = `你是一位专注帮助程序员、架构师和产品经理优化中文履历（Resume / CV）的资深合伙人猎头专家。
    你会把用户提供的某段平淡无奇的工作细节、项目要点或自我介绍做全方位的升级和润色。
    
    升级优化黄金法则：
    1. 增加可量化的成果指标。即使原本没有数字，请以注释方式指导用户：“（在此可填入具体提升百分比，如：提升40%）”。
    2. 开头字字见血，动作词开头：使用打动人心、高大上且不冗余的积极动词（如主导、突破、攻克、精构、降本、抗住）。
    3. 逻辑遵循 X-Y-Z 模式（因为做了什么 Z，让指标 Y 提升了 X），使句子极其紧贴业务痛点，表现卓越。
    4. 如果输入是英文，则用精炼的英文重写。如果多语言偏中，则用优雅现代的中文重构。
    
    格式：直接输出 2-3 种不同层级/侧重点的备选润色版本，排版高级精美。`;

    const prompt = `对以下简历的【${section || '经验要点'}】段落进行专业级文字升华与指标化打磨：
    
    ===
    ${content}
    ===`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.82,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Optimizing core section failed:', error);
    res.status(500).json({ error: error.message || 'Error executing optimization engine.' });
  }
});

// Setup Vite & static assets rendering depending on environments
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  startDevVite();
} else {
  // Production serving
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  // Single-Page Application catch-all route (Express v4 format is catchall via *)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server listenting on http://0.0.0.0:${PORT}`);
  });
}

async function startDevVite() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  
  app.use(vite.middlewares);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Development server running at http://0.0.0.0:${PORT}`);
  });
}
