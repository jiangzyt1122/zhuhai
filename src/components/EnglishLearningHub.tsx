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
  Shuffle
} from 'lucide-react';
import { DictionaryLookupResult } from '../services/youdaoDictionary';
import { lookupLearningDictionary } from '../services/learningDictionary';
import {
  LEARNING_ARTICLES,
  type ArticleLevelRecord,
  type ArticleLevelValue,
  type ArticleRecord
} from '../data/englishLearningArticles';

interface EnglishLearningHubProps {
  onBack: () => void;
}

type EnglishSection = 'articles' | 'wordbooks';
type MasteryFilter = 'all' | 'mastered' | 'unmastered';
type WordbookOrder = 'default' | 'random';
type WordbookScope = 'all' | string;
type QuizSelections = Record<string, number>;
type QuizSubmissions = Record<string, boolean>;

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
  articleId: string;
  articleLevel: ArticleLevelValue;
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
const ARTICLES: readonly ArticleRecord[] = LEARNING_ARTICLES;

const DEFAULT_ARTICLE = ARTICLES[0];
const ARTICLE_MAP = new Map(ARTICLES.map((article) => [article.id, article]));

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

const ARTICLE_TOKENS_BY_ID = new Map(
  ARTICLES.map((article) => [
    article.id,
    new Map(article.levels.map((levelRecord) => [levelRecord.level, buildArticleTokens(levelRecord.paragraphs)]))
  ])
);

const getArticleLevelRecord = (article: ArticleRecord, articleLevel: ArticleLevelValue): ArticleLevelRecord =>
  article.levels.find((levelRecord) => levelRecord.level === articleLevel) ?? article.levels[0];

const getDefaultArticleTitle = (article: ArticleRecord) => getArticleLevelRecord(article, 1).title;

const getArticleTokens = (articleId: string, articleLevel: ArticleLevelValue) => {
  const articleLevels = ARTICLE_TOKENS_BY_ID.get(articleId);
  const article = ARTICLE_MAP.get(articleId) ?? DEFAULT_ARTICLE;
  const fallbackLevel = article.levels[0]?.level ?? 1;

  return (
    articleLevels?.get(articleLevel) ??
    articleLevels?.get(fallbackLevel) ??
    ARTICLE_TOKENS_BY_ID.get(DEFAULT_ARTICLE.id)?.get(DEFAULT_ARTICLE.levels[0]?.level ?? 1)!
  );
};

const buildWordbookEntryId = (articleId: string, normalizedQuery: string) =>
  `${articleId}::${normalizedQuery}`;

const buildSelection = (
  articleId: string,
  articleLevel: ArticleLevelValue,
  range: WordRange
): ArticleSelection => {
  const articleTokens = getArticleTokens(articleId, articleLevel);
  const orderedRange = {
    start: Math.min(range.start, range.end),
    end: Math.max(range.start, range.end)
  };
  const normalizedTokens = articleTokens.wordTokens
    .filter((token) => token.wordIndex >= orderedRange.start && token.wordIndex <= orderedRange.end)
    .map((token) => token.normalized ?? normalizeWord(token.text));

  return {
    articleId,
    articleLevel,
    ...orderedRange,
    query: joinWordTokens(articleTokens.wordTokens, orderedRange),
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
        typeof candidate.query !== 'string' ||
        typeof candidate.normalizedQuery !== 'string' ||
        !Array.isArray(candidate.normalizedTokens)
      ) {
        return [];
      }

      const articleId =
        typeof candidate.articleId === 'string' && ARTICLE_MAP.has(candidate.articleId)
          ? candidate.articleId
          : DEFAULT_ARTICLE.id;
      const normalizedQuery = candidate.normalizedQuery;

      return [
        {
          id: buildWordbookEntryId(articleId, normalizedQuery),
          articleId,
          query: candidate.query,
          normalizedQuery,
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

const buildUnderlineSet = (
  entries: WordbookEntry[],
  articleId: string,
  articleLevel: ArticleLevelValue
) => {
  const highlightIndices = new Set<number>();
  const articleTokens = getArticleTokens(articleId, articleLevel);
  const articleWords = articleTokens.wordTokens.map(
    (token) => token.normalized ?? normalizeWord(token.text)
  );

  entries
    .filter((entry) => entry.articleId === articleId)
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

const buildQuizSelectionKey = (
  articleId: string,
  articleLevel: ArticleLevelValue,
  questionIndex: number
) => `${articleId}:${articleLevel}:${questionIndex}`;

const getQuizAnswerIndex = (question: ArticleLevelRecord['quiz'][number]) => {
  const numericIndex = Number(question.answer);
  if (
    Number.isInteger(numericIndex) &&
    numericIndex >= 1 &&
    numericIndex <= question.options.length
  ) {
    return numericIndex - 1;
  }

  const normalizedAnswer = normalizeWord(question.answer);
  const optionIndex = question.options.findIndex((option) => normalizeWord(option) === normalizedAnswer);
  return optionIndex >= 0 ? optionIndex : null;
};

export const EnglishLearningHub: React.FC<EnglishLearningHubProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<EnglishSection>('articles');
  const [openedArticleId, setOpenedArticleId] = useState<string | null>(null);
  const [activeArticleLevel, setActiveArticleLevel] = useState<ArticleLevelValue>(1);
  const [wordbookScope, setWordbookScope] = useState<WordbookScope | null>(null);
  const [wordbookReturnArticleId, setWordbookReturnArticleId] = useState<string | null>(null);
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
  const [quizSelections, setQuizSelections] = useState<QuizSelections>({});
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmissions>({});
  const dragAnchorRef = useRef<number | null>(null);
  const dragRangeRef = useRef<WordRange | null>(null);
  const didDragRef = useRef(false);

  const openedArticle = openedArticleId
    ? ARTICLE_MAP.get(openedArticleId) ?? DEFAULT_ARTICLE
    : null;
  const activeReadingArticleId = openedArticle?.id ?? null;
  const activeReadingLevelRecord = openedArticle
    ? getArticleLevelRecord(openedArticle, activeArticleLevel)
    : null;
  const activeReadingTokens =
    activeReadingArticleId && activeReadingLevelRecord
      ? getArticleTokens(activeReadingArticleId, activeReadingLevelRecord.level)
      : null;
  const isReadingDetail = activeSection === 'articles' && activeReadingArticleId != null;
  const isWordbookDetail = activeSection === 'wordbooks' && wordbookScope != null;
  const underlineSet = useMemo(
    () =>
      activeReadingArticleId && activeReadingLevelRecord
        ? buildUnderlineSet(wordbook, activeReadingArticleId, activeReadingLevelRecord.level)
        : new Set<number>(),
    [wordbook, activeReadingArticleId, activeReadingLevelRecord]
  );
  const activeRange = previewRange ?? selection;
  const currentLookup = lookupState.status === 'success' ? lookupState.data : null;
  const activeQuiz = activeReadingLevelRecord?.quiz ?? [];
  const activeQuizSubmissionKey =
    openedArticle && activeReadingLevelRecord
      ? `${openedArticle.id}:${activeReadingLevelRecord.level}`
      : null;
  const activeQuizSubmitted = activeQuizSubmissionKey ? quizSubmissions[activeQuizSubmissionKey] === true : false;
  const activeQuizSelections = useMemo(
    () =>
      !openedArticle || !activeReadingLevelRecord
        ? []
        : activeQuiz.map(
            (_question, questionIndex) =>
              quizSelections[
                buildQuizSelectionKey(openedArticle.id, activeReadingLevelRecord.level, questionIndex)
              ] ?? null
          ),
    [activeQuiz, activeReadingLevelRecord, openedArticle, quizSelections]
  );
  const activeQuizCorrectCount = useMemo(
    () =>
      activeQuiz.reduce((count, question, questionIndex) => {
        const selectedIndex = activeQuizSelections[questionIndex];
        const correctIndex = getQuizAnswerIndex(question);
        return count + (selectedIndex != null && correctIndex === selectedIndex ? 1 : 0);
      }, 0),
    [activeQuiz, activeQuizSelections]
  );
  const activeQuizAnsweredCount = activeQuizSelections.filter((value) => value != null).length;
  const activeQuizAllAnswered =
    activeQuiz.length > 0 && activeQuizAnsweredCount === activeQuiz.length;
  const currentLookupEntryId =
    currentLookup && selection
      ? buildWordbookEntryId(selection.articleId, currentLookup.normalizedQuery)
      : null;
  const isCurrentLookupSaved = currentLookupEntryId
    ? wordbook.some((entry) => entry.id === currentLookupEntryId)
    : false;
  const selectionWordCount = selection?.normalizedTokens.length ?? 0;
  const exceedsWordbookLimit = selectionWordCount > 5;
  const isWordbookActionDisabled = Boolean(currentLookup && !isCurrentLookupSaved && exceedsWordbookLimit);
  const wordbookCountByArticle = useMemo(() => {
    const next = new Map<string, number>();
    wordbook.forEach((entry) => {
      next.set(entry.articleId, (next.get(entry.articleId) ?? 0) + 1);
    });
    return next;
  }, [wordbook]);
  const wordbookGroups = useMemo(
    () =>
      ARTICLES.map((article) => ({
        article,
        count: wordbookCountByArticle.get(article.id) ?? 0
      })),
    [wordbookCountByArticle]
  );
  const scopedWordbook = useMemo(() => {
    if (wordbookScope == null) {
      return [];
    }

    if (wordbookScope === 'all') {
      return wordbook;
    }

    return wordbook.filter((entry) => entry.articleId === wordbookScope);
  }, [wordbook, wordbookScope]);
  const visibleWordbook = useMemo(() => {
    const filtered = scopedWordbook.filter((entry) => {
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
  }, [masteryFilter, randomOrderIds, scopedWordbook, wordbookOrder]);
  const wordbookScopeTitle = useMemo(() => {
    if (wordbookScope === 'all') {
      return '汇总单词本';
    }

    if (wordbookScope && ARTICLE_MAP.has(wordbookScope)) {
      return getDefaultArticleTitle(ARTICLE_MAP.get(wordbookScope)!);
    }

    return '单词本';
  }, [wordbookScope]);

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

    const wordIds = scopedWordbook.map((entry) => entry.id);
    setRandomOrderIds((prev) => {
      const retained = prev.filter((id) => wordIds.includes(id));
      const missing = wordIds.filter((id) => !retained.includes(id));
      const nextOrder = [...retained, ...shuffleIds(missing)];
      const unchanged = nextOrder.length === prev.length && nextOrder.every((id, index) => id === prev[index]);
      return unchanged ? prev : nextOrder;
    });
  }, [scopedWordbook, wordbookOrder]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragAnchorRef.current == null || !activeReadingArticleId) {
        return;
      }

      const draggedRange = dragRangeRef.current;
      dragAnchorRef.current = null;
      dragRangeRef.current = null;
      setPreviewRange(null);

      if (!draggedRange || !didDragRef.current || !activeReadingLevelRecord) {
        return;
      }

      didDragRef.current = false;
      setSelection(buildSelection(activeReadingArticleId, activeReadingLevelRecord.level, draggedRange));
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeReadingArticleId, activeReadingLevelRecord]);

  useEffect(() => {
    dragAnchorRef.current = null;
    dragRangeRef.current = null;
    didDragRef.current = false;
    setPreviewRange(null);
    setSelection(null);
    setLookupState({ status: 'idle' });
    setIsLookupModalOpen(false);
  }, [activeArticleLevel, activeSection, activeReadingArticleId, wordbookScope]);

  useEffect(() => {
    if (!selection) {
      setLookupState({ status: 'idle' });
      setIsLookupModalOpen(false);
      return;
    }

    let cancelled = false;
    setIsLookupModalOpen(true);
    setLookupState({ status: 'loading', query: selection.query });

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
    if (!activeReadingArticleId) {
      return;
    }

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
    if (!activeReadingArticleId) {
      return;
    }

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    if (!activeReadingLevelRecord) {
      return;
    }

    setSelection(
      buildSelection(activeReadingArticleId, activeReadingLevelRecord.level, {
        start: wordIndex,
        end: wordIndex
      })
    );
  };

  const clearSelection = () => {
    dragAnchorRef.current = null;
    dragRangeRef.current = null;
    didDragRef.current = false;
    setPreviewRange(null);
    setSelection(null);
    setIsLookupModalOpen(false);
  };

  const handleToggleWordbook = () => {
    const targetArticleId = selection?.articleId ?? activeReadingArticleId;

    if (!currentLookup || !targetArticleId || isWordbookActionDisabled) {
      return;
    }

    setWordbook((prev) => {
      const entryId = buildWordbookEntryId(targetArticleId, currentLookup.normalizedQuery);
      const exists = prev.some((entry) => entry.id === entryId);
      if (exists) {
        return prev.filter((entry) => entry.id !== entryId);
      }

      const nextEntry: WordbookEntry = {
        id: entryId,
        articleId: targetArticleId,
        query: currentLookup.query,
        normalizedQuery: currentLookup.normalizedQuery,
        normalizedTokens: selection?.normalizedTokens ?? currentLookup.normalizedQuery.split(' '),
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
    setRandomOrderIds(shuffleIds(scopedWordbook.map((entry) => entry.id)));
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

  const handleOpenArticlesHome = () => {
    setActiveSection('articles');
    setOpenedArticleId(null);
    setActiveArticleLevel(1);
    setWordbookScope(null);
    setWordbookReturnArticleId(null);
  };

  const handleOpenWordbooksHome = () => {
    setActiveSection('wordbooks');
    setOpenedArticleId(null);
    setActiveArticleLevel(1);
    setWordbookScope(null);
    setWordbookReturnArticleId(null);
  };

  const handleOpenArticle = (articleId: string) => {
    setActiveSection('articles');
    setOpenedArticleId(articleId);
    setActiveArticleLevel(1);
    setWordbookScope(null);
    setWordbookReturnArticleId(null);
  };

  const handleSwitchArticleLevel = (level: ArticleLevelValue) => {
    setActiveArticleLevel(level);
  };

  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (!openedArticle || !activeReadingLevelRecord) {
      return;
    }

    const nextSubmissionKey = `${openedArticle.id}:${activeReadingLevelRecord.level}`;
    setQuizSelections((prev) => ({
      ...prev,
      [buildQuizSelectionKey(openedArticle.id, activeReadingLevelRecord.level, questionIndex)]: optionIndex
    }));
    setQuizSubmissions((prev) => ({
      ...prev,
      [nextSubmissionKey]: false
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuizSubmissionKey || !activeQuizAllAnswered) {
      return;
    }

    setQuizSubmissions((prev) => ({
      ...prev,
      [activeQuizSubmissionKey]: true
    }));
  };

  const handleOpenWordbookScope = (scope: WordbookScope, returnArticleId: string | null = null) => {
    setActiveSection('wordbooks');
    setOpenedArticleId(returnArticleId);
    setWordbookScope(scope);
    setWordbookReturnArticleId(returnArticleId);
  };

  const handleReturnToArticle = () => {
    if (!wordbookReturnArticleId) {
      return;
    }

    setActiveSection('articles');
    setOpenedArticleId(wordbookReturnArticleId);
    setWordbookScope(null);
  };

  useEffect(() => {
    if (!selection || !isReadingDetail) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        clearSelection();
        return;
      }

      if (target.closest('[data-word-token="true"], [data-lookup-modal="true"]')) {
        return;
      }

      clearSelection();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isReadingDetail, selection]);

  const renderArticleListView = () => (
    <div className="mt-6 min-h-0 flex-1">
      <section className="flex h-full min-h-0 flex-col border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Articles</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">文章列表</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              先进入文章列表，再打开当天的阅读内容。发布时间字段已经预留，后面可以继续补。
            </p>
          </div>
          <span className="inline-flex h-10 items-center bg-slate-100 px-4 text-sm font-semibold text-slate-600">
            {ARTICLES.length} 篇
          </span>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4">
            {wordbookGroups.map(({ article, count }) => (
              <button
                key={article.id}
                type="button"
                onClick={() => handleOpenArticle(article.id)}
                className="border border-slate-200 bg-[#fcfaf4] p-5 text-left transition hover:border-slate-300 hover:bg-[#faf6ec]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500">
                      {article.publishedAt ?? '发布时间待记录'}
                    </div>
                    <h2 className="mt-4 text-2xl font-black leading-tight text-slate-900">
                      {getDefaultArticleTitle(article)}
                    </h2>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                      {count} 个词条
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderReadingDetailView = () => {
    if (!openedArticle || !activeReadingTokens || !activeReadingLevelRecord) {
      return null;
    }

    return (
      <div className="mt-6 min-h-0 flex-1">
        <section className="flex h-full min-h-0 flex-col border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <div className="shrink-0">
            <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              {activeReadingLevelRecord.title}
            </h1>
          </div>

          <div className="mt-6 grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-h-0 overflow-y-auto border border-slate-200/80 bg-[#fcfaf4] p-5 sm:p-6">
              <div className="space-y-5 select-none">
                {activeReadingTokens.paragraphTokens.map((paragraphTokens, paragraphIndex) => (
                  <p
                    key={`${openedArticle.id}-paragraph-${paragraphIndex}`}
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
                          data-word-token="true"
                          onMouseDown={() => handleWordMouseDown(token.wordIndex!)}
                          onMouseEnter={() => handleWordMouseEnter(token.wordIndex!)}
                          onClick={() => handleWordClick(token.wordIndex!)}
                          className={`relative inline px-0.5 transition ${
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

            <aside className="min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-5">
                <section className="border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Audio
                    </p>
                  </div>
                  <div className="p-4">
                    {activeReadingLevelRecord.audio ? (
                      <audio
                        key={`${openedArticle.id}-audio-${activeReadingLevelRecord.level}`}
                        controls
                        preload="none"
                        src={activeReadingLevelRecord.audio}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">当前 level 暂无音频。</p>
                    )}
                  </div>
                </section>

                <section className="border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quiz</p>
                  </div>

                  {activeQuiz.length === 0 ? (
                    <div className="px-4 py-6">
                      <p className="text-sm leading-6 text-slate-500">当前 level 暂无题目。</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-slate-200">
                        {activeQuiz.map((question, questionIndex) => {
                          const selectedIndex = activeQuizSelections[questionIndex];
                          const correctIndex = getQuizAnswerIndex(question);
                          const isSelected = (optionIndex: number) => selectedIndex === optionIndex;

                          return (
                            <div key={`${openedArticle.id}-quiz-${activeReadingLevelRecord.level}-${questionIndex}`} className="px-4 py-5">
                              <div className="flex gap-3">
                                <span className="pt-0.5 text-2xl font-light text-slate-300">
                                  {questionIndex + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h2 className="text-[1.15rem] font-medium leading-8 text-slate-900">
                                    {question.question}
                                  </h2>
                                  <div className="mt-4 space-y-3">
                                    {question.options.map((option, optionIndex) => {
                                      const isCorrect = correctIndex === optionIndex;
                                      const showCorrect = activeQuizSubmitted && isCorrect;
                                      const showIncorrect =
                                        activeQuizSubmitted && isSelected(optionIndex) && !isCorrect;
                                      const showSelected = !activeQuizSubmitted && isSelected(optionIndex);

                                      return (
                                        <button
                                          key={`${openedArticle.id}-quiz-option-${questionIndex}-${optionIndex}`}
                                          type="button"
                                          onClick={() => handleSelectQuizOption(questionIndex, optionIndex)}
                                          className={`flex w-full items-start gap-3 text-left transition ${
                                            showCorrect
                                              ? 'text-emerald-600'
                                              : showIncorrect
                                              ? 'text-rose-500'
                                              : showSelected
                                              ? 'text-slate-800'
                                              : 'text-slate-400 hover:text-slate-600'
                                          }`}
                                        >
                                          <span
                                            className={`mt-1.5 h-6 w-6 shrink-0 border ${
                                              showCorrect
                                                ? 'border-emerald-300 bg-emerald-300'
                                                : showIncorrect
                                                ? 'border-rose-300 bg-rose-200'
                                                : showSelected
                                                ? 'border-slate-400 bg-slate-200'
                                                : 'border-slate-200 bg-white'
                                            }`}
                                          >
                                            {showCorrect || showSelected ? (
                                              <span className="mx-auto mt-[5px] block h-2.5 w-2.5 bg-white" />
                                            ) : null}
                                          </span>
                                          <span className="text-[1.05rem] leading-8">{option}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-200 px-4 py-4">
                        <div className="flex flex-col gap-3">
                          {!activeQuizSubmitted ? (
                            <button
                              type="button"
                              onClick={handleSubmitQuiz}
                              disabled={!activeQuizAllAnswered}
                              className={`border px-4 py-3 text-base font-semibold transition ${
                                activeQuizAllAnswered
                                  ? 'border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
                                  : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                              }`}
                            >
                              提交
                            </button>
                          ) : null}

                          {activeQuizSubmitted ? (
                            <div className="border border-slate-200 bg-slate-50 px-4 py-4 text-center text-base font-semibold text-slate-800">
                              {activeQuizCorrectCount === activeQuiz.length ? (
                                <span>
                                  Excellent! ({activeQuizCorrectCount}/{activeQuiz.length}) Perfect score!
                                </span>
                              ) : (
                                <span>
                                  已答对 {activeQuizCorrectCount}/{activeQuiz.length}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  };

  const renderWordbookListView = () => (
    <div className="mt-6 min-h-0 flex-1">
      <section className="flex h-full min-h-0 flex-col border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Wordbooks</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">单词本列表</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              先进入单词本列表，再查看某篇文章对应的词条。汇总单词本固定放在最上面。
            </p>
          </div>
          <span className="inline-flex h-10 items-center bg-slate-100 px-4 text-sm font-semibold text-slate-600">
            {wordbook.length} 个词条
          </span>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => handleOpenWordbookScope('all')}
              className="border border-slate-200 bg-[#fcfaf4] p-5 text-left transition hover:border-slate-300 hover:bg-[#faf6ec]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="bg-slate-900 px-2.5 py-1 text-white">置顶</span>
                    <span className="bg-slate-100 px-2.5 py-1">全部文章</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black leading-tight text-slate-900">汇总单词本</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    查看所有文章累计收录的词条，统一复习和筛选。
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                    {wordbook.length} 个词条
                  </span>
                </div>
              </div>
            </button>

            {wordbookGroups.map(({ article, count }) => (
              <button
                key={article.id}
                type="button"
                onClick={() => handleOpenWordbookScope(article.id)}
                className="border border-slate-200 bg-[#fcfaf4] p-5 text-left transition hover:border-slate-300 hover:bg-[#faf6ec]"
              >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">
                    {article.publishedAt ?? '发布时间待记录'}
                  </div>
                  <h2 className="mt-4 text-2xl font-black leading-tight text-slate-900">
                    {getDefaultArticleTitle(article)}
                  </h2>
                </div>
                <div className="shrink-0">
                    <span className="inline-flex bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                      {count} 个词条
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderWordbookDetailView = () => (
    <div className="mt-6 min-h-0 flex-1">
      <div className="flex h-full min-h-0 flex-col overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-black leading-tight text-slate-900">{wordbookScopeTitle}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {wordbookScope === 'all'
                  ? '查看全部文章累计收录的词条。'
                  : wordbookScope && ARTICLE_MAP.has(wordbookScope)
                  ? `${ARTICLE_MAP.get(wordbookScope)!.publishedAt ?? '发布时间待记录'}`
                  : '按文章查看对应的词条。'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                {visibleWordbook.length}/{scopedWordbook.length}
              </span>
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

        {scopedWordbook.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">这个单词本还是空的</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                先去文章阅读里查词，再把词条加入对应文章的单词本。
              </p>
            </div>
          </div>
        ) : visibleWordbook.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">当前筛选下没有词条</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                可以切回全部，或者切换“学会 / 未学会”筛选。
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 hidden border-b border-slate-200 bg-white lg:grid lg:grid-cols-[3rem_minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_8.5rem] lg:gap-4 lg:px-4 lg:py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">#</span>
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
                            <p className="pt-1 text-sm leading-6 text-slate-600">{entry.explains.join('；')}</p>
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
                      <span className="mt-0.5 w-5 text-xs font-medium text-slate-400">{index + 1}</span>
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
                            <p className="pt-1 text-sm leading-6 text-slate-600">{entry.explains.join('；')}</p>
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
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-dvh overflow-hidden bg-[#f4efe6] text-slate-900">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-h-0 flex-1 flex-col border border-black/5 bg-white/70 p-4 shadow-[0_20px_80px_rgba(148,163,184,0.2)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={
                  isReadingDetail
                    ? handleOpenArticlesHome
                    : isWordbookDetail && wordbookReturnArticleId
                    ? handleReturnToArticle
                    : isWordbookDetail
                    ? handleOpenWordbooksHome
                    : onBack
                }
                className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                {isReadingDetail
                  ? '返回文章列表'
                  : isWordbookDetail && wordbookReturnArticleId
                  ? '返回文章'
                  : isWordbookDetail
                  ? '返回单词本列表'
                  : '返回入口'}
              </button>

              {isReadingDetail && openedArticle ? (
                <>
                  <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                    {openedArticle.publishedAt ?? '发布时间待记录'}
                  </div>
                  <div className="inline-flex border border-slate-200 bg-[#f4f0e8] p-1">
                    {openedArticle.levels.map((levelRecord) => (
                      <button
                        key={`${openedArticle.id}-top-level-${levelRecord.level}`}
                        type="button"
                        onClick={() => handleSwitchArticleLevel(levelRecord.level)}
                        className={`min-w-[5.8rem] border px-4 py-2 text-lg font-semibold tracking-tight transition ${
                          levelRecord.level === activeReadingLevelRecord?.level
                            ? 'border-slate-300 bg-white text-slate-700 shadow-[0_1px_0_rgba(148,163,184,0.2)]'
                            : 'border-transparent bg-[#f4f0e8] text-slate-500 hover:bg-white/80'
                        }`}
                      >
                        Level {levelRecord.level}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className="inline-flex border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={handleOpenArticlesHome}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
                  activeSection === 'articles' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen size={16} />
                文章列表
              </button>
              <button
                type="button"
                onClick={
                  isReadingDetail && openedArticle
                    ? () => handleOpenWordbookScope(openedArticle.id, openedArticle.id)
                    : handleOpenWordbooksHome
                }
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
                  activeSection === 'wordbooks'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <NotebookPen size={16} />
                单词本
                <span
                  className={`px-2 py-0.5 text-xs ${
                    activeSection === 'wordbooks' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {wordbook.length}
                </span>
              </button>
            </div>
          </div>

          {activeSection === 'articles'
            ? isReadingDetail
              ? renderReadingDetailView()
              : renderArticleListView()
            : isWordbookDetail
            ? renderWordbookDetailView()
            : renderWordbookListView()}
        </div>
      </div>

      {isReadingDetail && isLookupModalOpen && (
        <div className="fixed inset-0 z-[700] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center sm:p-6">
          <div
            className="absolute inset-0"
            onClick={clearSelection}
            aria-hidden="true"
          />

          <div
            data-lookup-modal="true"
            className="relative z-10 flex max-h-[min(78dvh,42rem)] w-[min(92vw,48rem)] flex-col overflow-hidden rounded-[2rem] bg-[#111827] p-5 text-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:p-6"
          >
            <div className="flex shrink-0 items-center justify-between gap-4">
              <p className="text-sm font-semibold text-amber-200/90">
                Lookup Panel
              </p>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                关闭
              </button>
            </div>

            <div className="mt-4 flex min-h-0 flex-col gap-4 overflow-hidden">
              {selection ? (
                <div className="shrink-0 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="max-h-[min(22dvh,10rem)] overflow-y-auto pr-1">
                    <p className="break-words text-sm leading-7 text-slate-100">
                      {selection.query}
                    </p>
                  </div>
                </div>
              ) : null}

              {lookupState.status === 'loading' && (
                <div className="flex shrink-0 items-center gap-3 rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
                  <LoaderCircle size={18} className="animate-spin" />
                  正在查询 “{lookupState.query}”
                </div>
              )}

              {lookupState.status === 'error' && (
                <div className="min-h-0 overflow-y-auto rounded-[1.5rem] bg-rose-500/10 p-4 text-sm leading-7 text-rose-100 ring-1 ring-rose-400/20">
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
                <>
                  <div className="rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="max-h-[min(28dvh,16rem)] space-y-2 overflow-y-auto pr-1">
                      {currentLookup.explains.map((explain) => (
                        <p
                          key={explain}
                          className="break-words rounded-2xl bg-white/5 px-3 py-2 text-sm leading-7 text-slate-100"
                        >
                          {explain}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleToggleWordbook}
                      disabled={isWordbookActionDisabled}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                        isWordbookActionDisabled
                          ? 'cursor-not-allowed bg-slate-700/80 text-slate-400 ring-1 ring-white/10'
                          : isCurrentLookupSaved
                          ? 'bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/25 hover:bg-rose-500/20'
                          : 'bg-amber-300 text-slate-900 hover:bg-amber-200'
                      }`}
                    >
                      <Bookmark size={16} />
                      {isCurrentLookupSaved ? '取消加入单词本' : '加入单词本'}
                    </button>
                  </div>
                  {isWordbookActionDisabled ? (
                    <p className="shrink-0 text-sm text-amber-200/90">超过 5 个词的选择不能加入单词本。</p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
