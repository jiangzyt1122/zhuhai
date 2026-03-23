import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Eye,
  EyeOff,
  LoaderCircle,
  NotebookPen,
  RotateCcw,
  Shuffle,
  Volume2
} from 'lucide-react';
import { DictionaryLookupResult } from '../services/youdaoDictionary';
import {
  lookupLearningDictionary,
  lookupLearningPronunciation
} from '../services/learningDictionary';

interface EnglishLearningHubProps {
  onBack: () => void;
}

type ReadingTab = 'reading' | 'wordbook';
type MasteryFilter = 'all' | 'mastered' | 'unmastered';
type WordbookOrder = 'default' | 'random';

type ArticleToken = {
  id: string;
  text: string;
  type: 'word' | 'space' | 'punct';
  paragraphIndex: number;
  wordIndex?: number;
  normalized?: string;
};

type WordRange = {
  start: number;
  end: number;
};

type ArticleSelection = WordRange & {
  query: string;
  normalizedQuery: string;
  normalizedTokens: string[];
};

type LookupState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; data: DictionaryLookupResult }
  | { status: 'error'; query: string; message: string };

type WordbookEntry = {
  id: string;
  articleId: string;
  query: string;
  normalizedQuery: string;
  normalizedTokens: string[];
  usPhonetic: string;
  usSpeech: string | null;
  explains: string[];
  antonyms: string[];
  manualMeaning: string;
  manualDictation: string;
  mastered: boolean;
  savedAt: string;
};

const WORDBOOK_STORAGE_KEY = 'englishLearningWordbook/v1';

const ARTICLE = {
  id: 'pop-mart-labubu-film',
  title: 'Pop Mart Bets on Labubu Beyond the Blind Box',
  paragraphs: [
    "Pop Mart, the Chinese toy manufacturer behind the global Labubu phenomenon, has partnered with Sony Pictures to develop a feature film combining live action and computer-generated animation. The project, currently in early development, will be directed by Paul King, whose impressive portfolio includes Wonka, the Paddington franchise, and the BBC comedy series The Mighty Boosh.",
    "The Labubu dolls have transformed Pop Mart into a toy-making behemoth valued at nearly $40 billion, surpassing established competitors like Mattel. Part of their appeal lies in the blind box sales model-buyers remain unaware of which specific Labubu they're acquiring until opening the package. This marketing strategy, combined with celebrity endorsements from figures like Rihanna and Blackpink's Lisa, has propelled the toys to international prominence.",
    "Created over a decade ago by Hong Kong artist Kasing Lung, Labubu is a forest elf inspired by Nordic mythology and featured in Lung's book series, The Monsters. Lung will serve as executive producer, while King will collaborate with Steven Levenson on script development.",
    `Marketing experts suggest this venture represents a strategic evolution for Pop Mart. "For Gen Z and Millennial consumers, content and commerce are closely intertwined," notes Kim Dayoung from the National University of Singapore. The film could capitalize on the momentum of Chinese animation following recent blockbusters like Ne Zha 2 and Black Myth: Wukong, potentially establishing Pop Mart as a comprehensive entertainment brand rather than merely a toy retailer.`
  ]
} as const;

const TOKEN_REGEX = /([A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*)|(\s+)|([^A-Za-z0-9\s]+)/g;

const normalizeWord = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const joinWordTokens = (tokens: ArticleToken[], range: WordRange) =>
  tokens
    .filter((token) => token.type === 'word' && token.wordIndex != null)
    .filter((token) => token.wordIndex! >= range.start && token.wordIndex! <= range.end)
    .map((token) => token.text)
    .join(' ');

const buildArticleTokens = (paragraphs: readonly string[]) => {
  let wordIndex = 0;
  const paragraphTokens: ArticleToken[][] = paragraphs.map((paragraph, paragraphIndex) => {
    const matches = Array.from(paragraph.matchAll(TOKEN_REGEX));

    return matches.map((match, tokenIndex) => {
      const raw = match[0];
      if (match[1]) {
        const token: ArticleToken = {
          id: `p${paragraphIndex}-w${wordIndex}-t${tokenIndex}`,
          text: raw,
          type: 'word',
          paragraphIndex,
          wordIndex,
          normalized: normalizeWord(raw)
        };
        wordIndex += 1;
        return token;
      }

      return {
        id: `p${paragraphIndex}-t${tokenIndex}`,
        text: raw,
        type: match[2] ? 'space' : 'punct',
        paragraphIndex
      } satisfies ArticleToken;
    });
  });

  const wordTokens = paragraphTokens.flat().filter((token): token is ArticleToken & { wordIndex: number } => {
    return token.type === 'word' && typeof token.wordIndex === 'number';
  });

  return {
    paragraphTokens,
    wordTokens
  };
};

const ARTICLE_TOKENS = buildArticleTokens(ARTICLE.paragraphs);

const buildSelection = (range: WordRange): ArticleSelection => {
  const orderedRange = {
    start: Math.min(range.start, range.end),
    end: Math.max(range.start, range.end)
  };
  const normalizedTokens = ARTICLE_TOKENS.wordTokens
    .filter((token) => token.wordIndex >= orderedRange.start && token.wordIndex <= orderedRange.end)
    .map((token) => token.normalized ?? normalizeWord(token.text));

  return {
    ...orderedRange,
    query: joinWordTokens(ARTICLE_TOKENS.wordTokens, orderedRange),
    normalizedQuery: normalizedTokens.join(' '),
    normalizedTokens
  };
};

const loadWordbook = (): WordbookEntry[] => {
  try {
    const raw = window.localStorage.getItem(WORDBOOK_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const candidate = item as Partial<WordbookEntry>;
      if (
        typeof candidate.id !== 'string' ||
        typeof candidate.query !== 'string' ||
        typeof candidate.normalizedQuery !== 'string' ||
        !Array.isArray(candidate.normalizedTokens)
      ) {
        return [];
      }

      return [
        {
          id: candidate.id,
          articleId: typeof candidate.articleId === 'string' ? candidate.articleId : ARTICLE.id,
          query: candidate.query,
          normalizedQuery: candidate.normalizedQuery,
          normalizedTokens: candidate.normalizedTokens.filter(
            (token): token is string => typeof token === 'string'
          ),
          usPhonetic: typeof candidate.usPhonetic === 'string' ? candidate.usPhonetic : '',
          usSpeech: typeof candidate.usSpeech === 'string' ? candidate.usSpeech : null,
          explains: Array.isArray(candidate.explains)
            ? candidate.explains.filter((value): value is string => typeof value === 'string')
            : [],
          antonyms: Array.isArray(candidate.antonyms)
            ? candidate.antonyms.filter((value): value is string => typeof value === 'string')
            : [],
          manualMeaning: typeof candidate.manualMeaning === 'string' ? candidate.manualMeaning : '',
          manualDictation: typeof candidate.manualDictation === 'string' ? candidate.manualDictation : '',
          mastered: candidate.mastered === true,
          savedAt: typeof candidate.savedAt === 'string' ? candidate.savedAt : new Date().toISOString()
        }
      ];
    });
  } catch {
    return [];
  }
};

const buildUnderlineSet = (entries: WordbookEntry[]) => {
  const highlightIndices = new Set<number>();
  const articleWords = ARTICLE_TOKENS.wordTokens.map((token) => token.normalized ?? normalizeWord(token.text));

  entries
    .filter((entry) => entry.articleId === ARTICLE.id)
    .forEach((entry) => {
      const phrase = entry.normalizedTokens;
      if (phrase.length === 0) {
        return;
      }

      for (let index = 0; index <= articleWords.length - phrase.length; index += 1) {
        const matches = phrase.every((token, offset) => articleWords[index + offset] === token);
        if (!matches) {
          continue;
        }

        for (let offset = 0; offset < phrase.length; offset += 1) {
          highlightIndices.add(index + offset);
        }
      }
    });

  return highlightIndices;
};

const shuffleIds = (ids: string[]) => {
  const next = [...ids];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

const playAudio = async (url: string | null) => {
  if (!url) {
    return;
  }
  const audio = new Audio(url);
  await audio.play();
};

export const EnglishLearningHub: React.FC<EnglishLearningHubProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ReadingTab>('reading');
  const [selection, setSelection] = useState<ArticleSelection | null>(null);
  const [previewRange, setPreviewRange] = useState<WordRange | null>(null);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' });
  const [wordbook, setWordbook] = useState<WordbookEntry[]>(() => loadWordbook());
  const [expandedExplainIds, setExpandedExplainIds] = useState<Record<string, boolean>>({});
  const [isEnglishColumnVisible, setIsEnglishColumnVisible] = useState(true);
  const [isExplainColumnVisible, setIsExplainColumnVisible] = useState(true);
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
  const [wordbookOrder, setWordbookOrder] = useState<WordbookOrder>('default');
  const [randomOrderIds, setRandomOrderIds] = useState<string[]>([]);
  const [audioUrlCache, setAudioUrlCache] = useState<Record<string, string | null>>({});
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [audioErrorMessage, setAudioErrorMessage] = useState('');
  const dragAnchorRef = useRef<number | null>(null);
  const dragRangeRef = useRef<WordRange | null>(null);
  const didDragRef = useRef(false);

  const underlineSet = useMemo(() => buildUnderlineSet(wordbook), [wordbook]);
  const activeRange = previewRange ?? selection;
  const currentLookup = lookupState.status === 'success' ? lookupState.data : null;
  const isCurrentLookupSaved = currentLookup
    ? wordbook.some((entry) => entry.id === currentLookup.normalizedQuery)
    : false;
  const visibleWordbook = useMemo(() => {
    const filtered = wordbook.filter((entry) => {
      if (masteryFilter === 'mastered') {
        return entry.mastered;
      }
      if (masteryFilter === 'unmastered') {
        return !entry.mastered;
      }
      return true;
    });

    if (wordbookOrder !== 'random') {
      return filtered;
    }

    const orderMap = new Map(randomOrderIds.map((id, index) => [id, index]));
    return [...filtered].sort((left, right) => {
      return (
        (orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }, [masteryFilter, randomOrderIds, wordbook, wordbookOrder]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WORDBOOK_STORAGE_KEY, JSON.stringify(wordbook));
    } catch {
      // ignore write failures
    }
  }, [wordbook]);

  useEffect(() => {
    if (wordbookOrder !== 'random') {
      return;
    }

    const wordIds = wordbook.map((entry) => entry.id);
    setRandomOrderIds((prev) => {
      const retained = prev.filter((id) => wordIds.includes(id));
      const missing = wordIds.filter((id) => !retained.includes(id));
      const nextOrder = [...retained, ...shuffleIds(missing)];
      const unchanged = nextOrder.length === prev.length && nextOrder.every((id, index) => id === prev[index]);
      return unchanged ? prev : nextOrder;
    });
  }, [wordbook, wordbookOrder]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragAnchorRef.current == null) {
        return;
      }

      const draggedRange = dragRangeRef.current;
      dragAnchorRef.current = null;
      dragRangeRef.current = null;
      setPreviewRange(null);

      if (!draggedRange || !didDragRef.current) {
        return;
      }

      didDragRef.current = false;
      setSelection(buildSelection(draggedRange));
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!selection) {
      setLookupState({ status: 'idle' });
      setIsLookupModalOpen(false);
      setAudioErrorMessage('');
      return;
    }

    let cancelled = false;
    setIsLookupModalOpen(true);
    setLookupState({ status: 'loading', query: selection.query });
    setAudioErrorMessage('');

    lookupLearningDictionary(selection.query)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setLookupState({ status: 'success', data });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : '查词失败。';
        setLookupState({ status: 'error', query: selection.query, message });
      });

    return () => {
      cancelled = true;
    };
  }, [selection]);

  const handleWordMouseDown = (wordIndex: number) => {
    dragAnchorRef.current = wordIndex;
    dragRangeRef.current = {
      start: wordIndex,
      end: wordIndex
    };
    didDragRef.current = false;
    setPreviewRange({
      start: wordIndex,
      end: wordIndex
    });
  };

  const handleWordMouseEnter = (wordIndex: number) => {
    if (dragAnchorRef.current == null) {
      return;
    }

    didDragRef.current = true;
    const nextRange = {
      start: Math.min(dragAnchorRef.current, wordIndex),
      end: Math.max(dragAnchorRef.current, wordIndex)
    };
    dragRangeRef.current = nextRange;
    setPreviewRange(nextRange);
  };

  const handleWordClick = (wordIndex: number) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    setSelection(buildSelection({ start: wordIndex, end: wordIndex }));
  };

  const handleToggleWordbook = () => {
    if (!currentLookup) {
      return;
    }

    setWordbook((prev) => {
      const exists = prev.some((entry) => entry.id === currentLookup.normalizedQuery);
      if (exists) {
        return prev.filter((entry) => entry.id !== currentLookup.normalizedQuery);
      }

      const nextEntry: WordbookEntry = {
        id: currentLookup.normalizedQuery,
        articleId: ARTICLE.id,
        query: currentLookup.query,
        normalizedQuery: currentLookup.normalizedQuery,
        normalizedTokens: currentLookup.normalizedQuery.split(' '),
        usPhonetic: currentLookup.usPhonetic,
        usSpeech: currentLookup.usSpeech,
        explains: currentLookup.explains,
        antonyms: currentLookup.antonyms,
        manualMeaning: '',
        manualDictation: '',
        mastered: false,
        savedAt: new Date().toISOString()
      };

      return [nextEntry, ...prev.filter((entry) => entry.id !== nextEntry.id)];
    });
  };

  const handleToggleMastered = (entryId: string) => {
    setWordbook((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              mastered: !entry.mastered
            }
          : entry
      )
    );
  };

  const handleToggleExplainVisibility = (entryId: string) => {
    setExpandedExplainIds((prev) => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  const handleManualMeaningChange = (entryId: string, value: string) => {
    setWordbook((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              manualMeaning: value
            }
          : entry
      )
    );
  };

  const handleManualDictationChange = (entryId: string, value: string) => {
    setWordbook((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              manualDictation: value
            }
          : entry
      )
    );
  };

  const handleToggleWordbookOrder = () => {
    if (wordbookOrder === 'random') {
      setWordbookOrder('default');
      setRandomOrderIds([]);
      return;
    }

    setWordbookOrder('random');
    setRandomOrderIds(shuffleIds(wordbook.map((entry) => entry.id)));
  };

  const handleResetWordbookState = () => {
    setExpandedExplainIds({});
    setIsEnglishColumnVisible(true);
    setIsExplainColumnVisible(true);
    setMasteryFilter('all');
    setWordbookOrder('default');
    setRandomOrderIds([]);
    setWordbook((prev) =>
      prev.map((entry) => ({
        ...entry,
        manualMeaning: '',
        manualDictation: '',
        mastered: false
      }))
    );
  };

  const handlePlayCurrentLookup = async () => {
    if (!currentLookup) {
      return;
    }

    const cacheKey = currentLookup.normalizedQuery;
    const cachedUrl = audioUrlCache[cacheKey];
    if (cachedUrl) {
      setAudioErrorMessage('');
      await playAudio(cachedUrl);
      return;
    }

    setAudioLoadingId(cacheKey);
    setAudioErrorMessage('');

    try {
      const nextUrl = await lookupLearningPronunciation(currentLookup.query, currentLookup.source);
      setAudioUrlCache((prev) => ({
        ...prev,
        [cacheKey]: nextUrl
      }));

      if (!nextUrl) {
        throw new Error('当前内容没有可用发音。');
      }

      await playAudio(nextUrl);
    } catch (error) {
      setAudioErrorMessage(error instanceof Error ? error.message : '获取发音失败。');
    } finally {
      setAudioLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#f4efe6] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="border border-black/5 bg-white/70 p-4 shadow-[0_20px_80px_rgba(148,163,184,0.2)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                返回入口
              </button>
              <div className="rounded-full bg-[#1f2937] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                English Hub
              </div>
            </div>

            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('reading')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'reading' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen size={16} />
                文章阅读
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wordbook')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'wordbook' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <NotebookPen size={16} />
                单词本
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === 'wordbook' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {wordbook.length}
                </span>
              </button>
            </div>
          </div>

          {activeTab === 'reading' ? (
            <div className="mt-8">
              <section className="border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                <div>
                  <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                    {ARTICLE.title}
                  </h1>
                </div>

                <div className="mt-6 bg-[#fcfaf4] p-5 ring-1 ring-slate-200/80 sm:p-6">
                  <div className="space-y-5 select-none">
                    {ARTICLE_TOKENS.paragraphTokens.map((paragraphTokens, paragraphIndex) => (
                      <p
                        key={`paragraph-${paragraphIndex}`}
                        className="whitespace-pre-wrap text-[1.02rem] leading-8 text-slate-800"
                      >
                        {paragraphTokens.map((token) => {
                          if (token.type !== 'word' || token.wordIndex == null) {
                            return <span key={token.id}>{token.text}</span>;
                          }

                          const inActiveRange =
                            activeRange != null &&
                            token.wordIndex >= activeRange.start &&
                            token.wordIndex <= activeRange.end;
                          const isUnderlined = underlineSet.has(token.wordIndex);

                          return (
                            <button
                              key={token.id}
                              type="button"
                              onMouseDown={() => handleWordMouseDown(token.wordIndex!)}
                              onMouseEnter={() => handleWordMouseEnter(token.wordIndex!)}
                              onClick={() => handleWordClick(token.wordIndex!)}
                              className={`relative inline rounded-md px-0.5 transition ${
                                inActiveRange
                                  ? 'bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]'
                                  : 'text-slate-900 hover:bg-amber-100/80'
                              } ${isUnderlined ? 'underline decoration-[1.5px] decoration-dashed decoration-amber-400 underline-offset-[1px]' : ''}`}
                            >
                              {token.text}
                            </button>
                          );
                        })}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-8">
              <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                {wordbook.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <p className="text-lg font-bold text-slate-900">单词本还是空的</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      先去文章阅读里查一个单词，再把它加入单词本。
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-slate-900">单词本列表</p>
                          <span className="bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                            {visibleWordbook.length}/{wordbook.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                            <span>状态</span>
                            <select
                              value={masteryFilter}
                              onChange={(event) => setMasteryFilter(event.target.value as MasteryFilter)}
                              className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                            >
                              <option value="all">全部</option>
                              <option value="mastered">只看学会</option>
                              <option value="unmastered">只看未学会</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={handleToggleWordbookOrder}
                            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Shuffle size={14} />
                            {wordbookOrder === 'random' ? '默认排序' : '随机顺序'}
                          </button>
                          <button
                            type="button"
                            onClick={handleResetWordbookState}
                            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <RotateCcw size={14} />
                            恢复原始状态
                          </button>
                        </div>
                      </div>
                    </div>

                    {visibleWordbook.length === 0 ? (
                      <div className="px-6 py-16 text-center">
                        <p className="text-lg font-bold text-slate-900">当前筛选下没有词条</p>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          可以切回全部，或者切换“学会 / 未学会”筛选。
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="sticky top-0 z-10 hidden border-b border-slate-200 bg-white lg:grid lg:grid-cols-[3rem_minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_8.5rem] lg:gap-4 lg:px-4 lg:py-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            #
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              词条
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsEnglishColumnVisible((prev) => !prev)}
                              className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                              aria-label={isEnglishColumnVisible ? '隐藏英文列' : '显示英文列'}
                            >
                              {isEnglishColumnVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              中文释义
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsExplainColumnVisible((prev) => !prev)}
                              className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                              aria-label={isExplainColumnVisible ? '隐藏中文释义列' : '显示中文释义列'}
                            >
                              {isExplainColumnVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            手动中文释义
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            英文默写
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            状态
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {visibleWordbook.map((entry, index) => (
                            <div key={entry.id} className="px-4 py-3">
                              <div className="hidden lg:grid lg:grid-cols-[3rem_minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_8.5rem] lg:gap-4 lg:items-start">
                                <div className="pt-3 text-sm text-slate-400">{index + 1}</div>
                                <div className="pt-2">
                                  {isEnglishColumnVisible ? (
                                    <p className="break-words text-[15px] font-semibold leading-6 text-slate-900">
                                      {entry.query}
                                    </p>
                                  ) : (
                                    <span className="inline-flex bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                      已隐藏
                                    </span>
                                  )}
                                </div>
                                <div className="pt-1.5">
                                  {isExplainColumnVisible ? (
                                    <div className="flex min-h-11 items-start gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleExplainVisibility(entry.id)}
                                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                        aria-label={expandedExplainIds[entry.id] ? '收起释义' : '展开释义'}
                                      >
                                        {expandedExplainIds[entry.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                      </button>
                                      {expandedExplainIds[entry.id] ? (
                                        <p className="pt-1 text-sm leading-6 text-slate-600">
                                          {entry.explains.join('；')}
                                        </p>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <span className="inline-flex bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                      已隐藏
                                    </span>
                                  )}
                                </div>
                                <div className="pt-1.5">
                                  <input
                                    type="text"
                                    value={entry.manualMeaning}
                                    onChange={(event) => handleManualMeaningChange(entry.id, event.target.value)}
                                    placeholder="手动输入中文释义"
                                    className="h-11 w-full border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300"
                                  />
                                </div>
                                <div className="pt-1.5">
                                  <input
                                    type="text"
                                    value={entry.manualDictation}
                                    onChange={(event) => handleManualDictationChange(entry.id, event.target.value)}
                                    placeholder="手动填写英文"
                                    className="h-11 w-full border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300"
                                  />
                                </div>
                                <div className="pt-1.5">
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={entry.mastered}
                                    onClick={() => handleToggleMastered(entry.id)}
                                    className={`inline-flex items-center gap-3 border px-3 py-2 text-xs font-semibold transition ${
                                      entry.mastered
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    <span>{entry.mastered ? '学会' : '未学会'}</span>
                                    <span
                                      className={`relative h-6 w-11 border transition ${
                                        entry.mastered ? 'bg-emerald-500' : 'bg-slate-300'
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 h-5 w-5 bg-white shadow-sm transition ${
                                          entry.mastered ? 'left-[1.35rem]' : 'left-0.5'
                                        }`}
                                      />
                                    </span>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3 lg:hidden">
                                <div className="flex items-start gap-3">
                                  <span className="mt-0.5 w-5 text-xs font-medium text-slate-400">
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        词条
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setIsEnglishColumnVisible((prev) => !prev)}
                                        className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                                        aria-label={isEnglishColumnVisible ? '隐藏英文列' : '显示英文列'}
                                      >
                                        {isEnglishColumnVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                      </button>
                                    </div>
                                    <div className="mt-2">
                                      {isEnglishColumnVisible ? (
                                        <p className="break-words text-[15px] font-semibold leading-6 text-slate-900">
                                          {entry.query}
                                        </p>
                                      ) : (
                                        <span className="inline-flex bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                          已隐藏
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                      中文释义
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => setIsExplainColumnVisible((prev) => !prev)}
                                      className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                                      aria-label={isExplainColumnVisible ? '隐藏中文释义列' : '显示中文释义列'}
                                    >
                                      {isExplainColumnVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  </div>
                                  {isExplainColumnVisible ? (
                                    <div className="mt-2 flex min-h-9 items-start gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleExplainVisibility(entry.id)}
                                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                        aria-label={expandedExplainIds[entry.id] ? '收起释义' : '展开释义'}
                                      >
                                        {expandedExplainIds[entry.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                      </button>
                                      {expandedExplainIds[entry.id] ? (
                                        <p className="pt-1 text-sm leading-6 text-slate-600">
                                          {entry.explains.join('；')}
                                        </p>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <div className="mt-2">
                                      <span className="inline-flex bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                        已隐藏
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    手动中文释义
                                  </p>
                                  <input
                                    type="text"
                                    value={entry.manualMeaning}
                                    onChange={(event) => handleManualMeaningChange(entry.id, event.target.value)}
                                    placeholder="手动输入中文释义"
                                    className="mt-2 h-11 w-full border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300"
                                  />
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    英文默写
                                  </p>
                                  <input
                                    type="text"
                                    value={entry.manualDictation}
                                    onChange={(event) => handleManualDictationChange(entry.id, event.target.value)}
                                    placeholder="手动填写英文"
                                    className="mt-2 h-11 w-full border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300"
                                  />
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    状态
                                  </p>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={entry.mastered}
                                    onClick={() => handleToggleMastered(entry.id)}
                                    className={`mt-2 inline-flex items-center gap-3 border px-3 py-2 text-xs font-semibold transition ${
                                      entry.mastered
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    <span>{entry.mastered ? '学会' : '未学会'}</span>
                                    <span
                                      className={`relative h-6 w-11 border transition ${
                                        entry.mastered ? 'bg-emerald-500' : 'bg-slate-300'
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 h-5 w-5 bg-white shadow-sm transition ${
                                          entry.mastered ? 'left-[1.35rem]' : 'left-0.5'
                                        }`}
                                      />
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'reading' && isLookupModalOpen && (
        <div className="fixed inset-0 z-[700] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center sm:p-6">
          <div
            className="absolute inset-0"
            onClick={() => setIsLookupModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-[2rem] bg-[#111827] p-5 text-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                Lookup Panel
              </p>
              <button
                type="button"
                onClick={() => setIsLookupModalOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                关闭
              </button>
            </div>

            {selection ? (
              <div className="mt-4 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  当前选择
                </p>
                <p className="mt-3 break-words text-2xl font-black leading-tight text-white">
                  {selection.query}
                </p>
              </div>
            ) : null}

            {lookupState.status === 'loading' && (
              <div className="mt-5 flex items-center gap-3 rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
                <LoaderCircle size={18} className="animate-spin" />
                正在查询 “{lookupState.query}”
              </div>
            )}

            {lookupState.status === 'error' && (
              <div className="mt-5 rounded-[1.5rem] bg-rose-500/10 p-4 text-sm leading-7 text-rose-100 ring-1 ring-rose-400/20">
                <p className="font-semibold text-rose-200">查询失败</p>
                <p className="mt-2">{lookupState.message}</p>
                {lookupState.message.includes('纯静态部署') ? (
                  <p className="mt-3 text-rose-100/80">
                    现在这类线上静态部署只能直接使用站内词库。若要查整句或未收录内容，需要额外配置可公网访问的词典代理，
                    然后在前端设置 `VITE_YOUDAO_PROXY_URL`。
                  </p>
                ) : lookupState.message.includes('VITE_YOUDAO_APP_KEY') ? (
                  <p className="mt-3 text-rose-100/80">
                    当前已切到前端直连 JSONP 模式。要在线上使用整句翻译，需要在构建环境里设置
                    `VITE_YOUDAO_APP_KEY` 和 `VITE_YOUDAO_APP_SECRET`。
                  </p>
                ) : (
                  <p className="mt-3 text-rose-100/80">
                    本地代理模式请在运行 `npm run dev` 或 `npm run preview` 的环境里设置
                    `YOUDAO_APP_KEY` 和 `YOUDAO_APP_SECRET`；如果是静态部署并接受暴露密钥，则改为设置
                    `VITE_YOUDAO_APP_KEY` 和 `VITE_YOUDAO_APP_SECRET`。
                  </p>
                )}
              </div>
            )}

            {currentLookup && (
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    中文释义
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-slate-100">
                    {currentLookup.explains.map((explain) => (
                      <p key={explain} className="rounded-2xl bg-white/5 px-3 py-2">
                        {explain}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={audioLoadingId === currentLookup.normalizedQuery}
                    onClick={() => {
                      void handlePlayCurrentLookup();
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:border-white/5 disabled:text-slate-500"
                  >
                    {audioLoadingId === currentLookup.normalizedQuery ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Volume2 size={16} />
                    )}
                    发音
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleWordbook}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      isCurrentLookupSaved
                        ? 'bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/25 hover:bg-rose-500/20'
                        : 'bg-amber-300 text-slate-900 hover:bg-amber-200'
                    }`}
                  >
                    <Bookmark size={16} />
                    {isCurrentLookupSaved ? '取消加入单词本' : '加入单词本'}
                  </button>
                </div>
                {audioErrorMessage ? <p className="text-sm text-rose-200">{audioErrorMessage}</p> : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
