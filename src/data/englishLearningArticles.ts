import generatedArticleJson from './generatedEnglishArticles.json';

export type ArticleLevelValue = 1 | 2 | 3;

export type ArticleLevelRecord = {
  level: ArticleLevelValue;
  title: string;
  paragraphs: readonly string[];
  audio: string | null;
  quiz: readonly {
    question: string;
    options: readonly string[];
    answer: string;
  }[];
};

export type ArticleRecord = {
  id: string;
  title: string;
  summary: string;
  dailyLabel: string;
  publishedAt: string | null;
  levels: readonly ArticleLevelRecord[];
  articleUrl: string | null;
  originalUrl: string | null;
};

type ImportedArticlePayload = {
  articleUrl: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  originalUrl?: string | null;
  levels: Array<{
    level: number;
    title: string;
    content: string;
    audio?: string | null;
    quiz?: Array<{
      question: string;
      options: string[];
      answer: string | number;
    }>;
  }>;
};

type ArticleRecordWithSortKey = ArticleRecord & {
  sortKey: number;
};

const MOJIBAKE_REPLACEMENTS = [
  ['â', ' - '],
  ['â', ' - '],
  ['â', "'"],
  ['â', "'"],
  ['â', '"'],
  ['â', '"'],
  ['Â', '']
] as const;

const normalizeImportedText = (value: string) => {
  let next = value
    .replace(/\d+:\["\$","\$L23".*$/s, '')
    .replace(/\d+:T[0-9a-f]+,.*$/s, '')
    .trim();

  MOJIBAKE_REPLACEMENTS.forEach(([from, to]) => {
    next = next.replaceAll(from, to);
  });

  return next;
};

const splitParagraphs = (value: string) =>
  normalizeImportedText(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const coerceLevel = (value: number): ArticleLevelValue | null => {
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }

  return null;
};

const formatPublishedAt = (value: string | null) => {
  if (!value) {
    return null;
  }

  return value.slice(0, 10).replace(/-/g, '/');
};

const ARTICLE_ID_OVERRIDES: Record<string, string> = {
  'natural-doesnt-always-mean-better-understanding-the-appeal-to-nature': 'appeal-to-nature'
};

const extractArticleId = (articleUrl: string) => {
  const slug = articleUrl.split('/').filter(Boolean).pop() ?? articleUrl;
  return ARTICLE_ID_OVERRIDES[slug] ?? slug;
};

const createImportedArticle = (
  payload: ImportedArticlePayload,
  overrideId?: string
): ArticleRecordWithSortKey => {
  const levels = payload.levels
    .map((level) => {
      const levelValue = coerceLevel(level.level);
      if (!levelValue) {
        return null;
      }

      return {
        level: levelValue,
        title: level.title,
        paragraphs: splitParagraphs(level.content),
        audio: typeof level.audio === 'string' ? level.audio : null,
        quiz: Array.isArray(level.quiz)
          ? level.quiz
              .filter(
                (quizItem) =>
                  quizItem &&
                  typeof quizItem.question === 'string' &&
                  Array.isArray(quizItem.options) &&
                  quizItem.options.every((option) => typeof option === 'string') &&
                  (typeof quizItem.answer === 'string' || typeof quizItem.answer === 'number')
              )
              .map((quizItem) => ({
                question: normalizeImportedText(quizItem.question),
                options: quizItem.options.map((option) => normalizeImportedText(option)),
                answer: String(quizItem.answer)
              }))
          : []
      } satisfies ArticleLevelRecord;
    })
    .filter((level): level is ArticleLevelRecord => level != null)
    .sort((left, right) => left.level - right.level);

  return {
    id: overrideId ?? extractArticleId(payload.articleUrl),
    title: payload.title,
    summary: payload.summary,
    dailyLabel: '',
    publishedAt: formatPublishedAt(payload.publishedAt),
    levels,
    articleUrl: payload.articleUrl,
    originalUrl: payload.originalUrl ?? null,
    sortKey: payload.publishedAt ? Date.parse(payload.publishedAt) : Number.MIN_SAFE_INTEGER
  };
};

const createRepeatedLevels = (title: string, paragraphs: readonly string[]): readonly ArticleLevelRecord[] =>
  ([1, 2, 3] as const).map((level) => ({
    level,
    title: level === 1 ? title : `Level ${level}`,
    paragraphs,
    audio: null,
    quiz: []
  }));

const POP_MART_PARAGRAPHS = [
  "Pop Mart, the Chinese toy manufacturer behind the global Labubu phenomenon, has partnered with Sony Pictures to develop a feature film combining live action and computer-generated animation. The project, currently in early development, will be directed by Paul King, whose impressive portfolio includes Wonka, the Paddington franchise, and the BBC comedy series The Mighty Boosh.",
  "The Labubu dolls have transformed Pop Mart into a toy-making behemoth valued at nearly $40 billion, surpassing established competitors like Mattel. Part of their appeal lies in the blind box sales model-buyers remain unaware of which specific Labubu they're acquiring until opening the package. This marketing strategy, combined with celebrity endorsements from figures like Rihanna and Blackpink's Lisa, has propelled the toys to international prominence.",
  "Created over a decade ago by Hong Kong artist Kasing Lung, Labubu is a forest elf inspired by Nordic mythology and featured in Lung's book series, The Monsters. Lung will serve as executive producer, while King will collaborate with Steven Levenson on script development.",
  `Marketing experts suggest this venture represents a strategic evolution for Pop Mart. "For Gen Z and Millennial consumers, content and commerce are closely intertwined," notes Kim Dayoung from the National University of Singapore. The film could capitalize on the momentum of Chinese animation following recent blockbusters like Ne Zha 2 and Black Myth: Wukong, potentially establishing Pop Mart as a comprehensive entertainment brand rather than merely a toy retailer.`
] as const;

const MANUAL_ARTICLES: readonly ArticleRecordWithSortKey[] = [
  {
    id: 'pop-mart-labubu-film',
    title: 'Pop Mart Bets on Labubu Beyond the Blind Box',
    summary:
      'Pop Mart and Sony Pictures are turning the Labubu phenomenon into a feature film, extending the brand beyond blind box toys.',
    dailyLabel: '',
    publishedAt: null,
    levels: createRepeatedLevels('Pop Mart Bets on Labubu Beyond the Blind Box', POP_MART_PARAGRAPHS),
    articleUrl: null,
    originalUrl: null,
    sortKey: Number.MIN_SAFE_INTEGER
  }
];

const IMPORTED_ARTICLES: readonly ArticleRecordWithSortKey[] = Array.isArray(
  generatedArticleJson as ImportedArticlePayload[]
)
  ? (generatedArticleJson as ImportedArticlePayload[]).map((payload) => createImportedArticle(payload))
  : [];

export const LEARNING_ARTICLES: readonly ArticleRecord[] = [...IMPORTED_ARTICLES, ...MANUAL_ARTICLES]
  .sort((left, right) => right.sortKey - left.sortKey)
  .map(({ sortKey: _sortKey, ...article }, index) => ({
    ...article,
    dailyLabel: `每日一篇 ${String(index + 1).padStart(2, '0')}`
  }));
